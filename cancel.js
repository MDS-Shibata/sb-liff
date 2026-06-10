
const GAS_URL = "https://script.google.com/macros/s/AKfycbz-lEX0Hk4ofQUJ1BWKFLEXsUkibpV_zSNVYlT_XMprYiWRSCSxXZxjPwCsLkYIT7fg/exec";

async function main() {
  await liff.init({ liffId: "2010140886-GXbWv0ge" });

  // ★ ここを修正：確実に userId を取得
  const profile = await liff.getProfile();
  const userId = profile.userId;

  // ★ デバッグログ（ここに入れる）
  console.log("userId=", userId);
  console.log("送信データ=", JSON.stringify({ mode: "cancel", userId: userId }));

  // ★ 予約一覧取得
/*  const res = await fetch(GAS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode: "cancel",
      userId: userId
    })
  });*/

 const res = await fetch(GAS_URL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    mode: "cancel",
    userId: userId
  })
});


// 変数名を下の処理（reservations.lengthなど）と合わせるため、
// ここで1回だけ「reservations」という名前でデータを受け取ります
const reservations = await res.json(); 

console.log("GASから届いたデータ:", reservations);
  
//玉と読み込み中の表示停止
  document.getElementById("loading").style.display = "none";

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

 

  if (reservations.length === 0) {
    list.innerHTML = "現在キャンセルできる予約はありません。";
    return;
  }

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
  document.getElementById("loading").style.display = "block"; // ← 処理中の表示

  const targets = [];
  checks.forEach(c => {
    targets.push({
      sheetName: c.dataset.sheet,
      row: Number(c.dataset.row)
    });
  });

  try {
    const res = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "cancelExec",
        userId: userId,
        targets: targets
      })
    });

    const json = await res.json();

    if (json.success) {
      // ★ 完了メッセージ
      alert("キャンセルが完了しました。");

      // LIFF を閉じる
      liff.closeWindow();
    } else {
      alert("キャンセルに失敗しました。");
    }

  } catch (err) {
    alert("通信エラーが発生しました。");
  }

  // ★ 失敗時のみ画面を戻す（成功時は closeWindow）
  document.getElementById("list").style.display = "block";
  document.getElementById("cancelBtn").style.display = "block";
  document.getElementById("loading").style.display = "none";
};
  
}

window.onload = main;


