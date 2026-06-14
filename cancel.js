const GAS_URL = "https://script.google.com/macros/s/AKfycbxn7gjNnaISE-lMvTey5klTdy1FYOH6E86i_jJekhU5AgUc9yNrpVyTL8zJjrJpigef/exec";

async function main() {
  try {
    // ★ LIFF 初期化を確実に待つ
    await liff.init({ liffId: "2010140886-GXbWv0ge" });
  
    if (!liff.isLoggedIn()) {
      liff.login();
      return;
    }

    console.log("LIFF initialized successfully");

    // 1. URLの後ろについているパラメーター（?userId=xxx）を読み取る
    const params = new URLSearchParams(window.location.search);
    let userId = params.get("userId");

    // 2. もしURLから取得できなかった時のための安全策（通常通りLINEから取得）
    if (!userId) {
      const profile = await liff.getProfile();
      userId = profile.userId;
    }
  
    console.log("userId=", userId);

    // ★ 予約一覧取得
    const res = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "cancel",
        userId: userId
      })
    });

    const reservations = await res.json(); 
    console.log("GASから届いたデータ:", reservations);

    // ローディングの表示停止
    document.getElementById("loading").style.display = "none";

    if (reservations.length === 0) {
      document.getElementById("list").innerHTML = "<p style='font-size:40px; margin-top:40px;'>現在キャンセルできる予約はありません。</p>";
      return;
    }

    // 表の枠を作成
    const list = document.getElementById("list");
    list.innerHTML = `
      <div style="margin-bottom: 40px;font-size: 40px;">
        <h3 style="background:#7fffd4; padding:10px;">登校予約</h3>
        <table border="1" style="width:100%; border-collapse:collapse;">  
          <thead>
            <tr style="background:#f8f8f8;">
                 <th style="font-weight:300; font-size:30px;">✓</th>      
                 <th style="font-weight:300; font-size:30px;">乗車日</th>
                 <th style="font-weight:300; font-size:30px;">車校着</th>
                 <th style="font-weight:300; font-size:30px;">乗車バス停</th>
            </tr>
          </thead>
          <tbody id="toSchoolList"></tbody>
        </table>
      </div>

      <div style="margin-bottom: 40px;font-size: 40px;">
        <h3 style="background:#87cefa; padding:10px;">下校予約</h3>
        <table border="1" style="width:100%; border-collapse:collapse;">
          <thead>
            <tr style="background:#f8f8f8;">
                 <th style="font-weight:300; font-size:30px;">✓</th>      
                 <th style="font-weight:300; font-size:30px;">乗車日</th>
                 <th style="font-weight:300; font-size:30px;">車校発</th>
                 <th style="font-weight:300; font-size:30px;">降車バス停</th>
            </tr>
          </thead>
          <tbody id="fromSchoolList"></tbody>
        </table>
      </div>
    `;

    const toSchoolList = document.getElementById("toSchoolList");
    const fromSchoolList = document.getElementById("fromSchoolList");

    // データを表に追加
    reservations.forEach((r) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><input type="checkbox" class="chk" data-sheet="${r.sheetName}" data-row="${r.row}"></td>
        <td>${r.rideDate}</td>
        <td>${r.time || ""}</td>
        <td>${r.place}</td>
      `;

      if (r.sheetName.includes("登校")) {
        toSchoolList.appendChild(row);
      } else if (r.sheetName.includes("下校")) {
        fromSchoolList.appendChild(row);
      }
    });

    // ★ チェックした行を赤くする
    document.addEventListener("change", (e) => {
      if (e.target.classList.contains("chk")) {
        const tr = e.target.closest("tr");
        if (e.target.checked) {
          tr.classList.add("tr-selected");
        } else {
          tr.classList.remove("tr-selected");
        }
      }
    });

    // ★ キャンセル実行
    document.getElementById("cancelBtn").onclick = async () => {
      const checks = document.querySelectorAll(".chk:checked");

      if (checks.length === 0) {
        alert("キャンセルする予約を選択してください。");
        return;
      }

      // ★ キャンセル開始 → 画面を「処理中」に切り替え
      document.getElementById("list").style.display = "none";
      document.getElementById("cancelBtn").style.display = "none";
      document.getElementById("loading").style.display = "block";

      const targets = [];
      checks.forEach(c => {
        targets.push({
          sheetName: c.dataset.sheet,
          row: Number(c.dataset.row)
        });
      });

      try {
        const execRes = await fetch(GAS_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "cancelExec",
            userId: userId,
            targets: targets
          })
        });

        const json = await execRes.json();

        if (json.success) {
          alert("キャンセルが完了しました。");
          liff.closeWindow();
        } else {
          alert("キャンセルに失敗しました。");
        }

      } catch (err) {
        alert("通信エラーが発生しました。");
      }

      // 失敗時のみ画面を戻す
      document.getElementById("list").style.display = "block";
      document.getElementById("cancelBtn").style.display = "block";
      document.getElementById("loading").style.display = "none";
    };

  } catch (err) {
    console.error("エラーが発生しました:", err);
    alert("エラーが発生しました。");
  }
}

window.onload = main;
