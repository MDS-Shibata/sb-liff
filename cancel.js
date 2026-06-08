
const GAS_URL = "https://script.google.com/macros/s/AKfycby2YYr7iTUjhMtqQU57bUQCmSGdPC1f6qU85fAc4_w7rqhFWmsMR_K9mSmcp-abCfS4/exec";

async function main() {
  await liff.init({ liffId: "2010140886-GXbWv0ge" });

  // ★ ここを修正：確実に userId を取得
  const profile = await liff.getProfile();
  const userId = profile.userId;

  // ★ デバッグログ（ここに入れる）
  console.log("userId=", userId);
  console.log("送信データ=", JSON.stringify({ mode: "cancel", userId: userId }));

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
  const list = document.getElementById("list");

  if (reservations.length === 0) {
    list.innerHTML = "現在キャンセルできる予約はありません。";
    return;
  }

  list.innerHTML = "";
  reservations.forEach((r) => {
    const div = document.createElement("div");
    div.className = "item";

    div.innerHTML = `
      <label>
        <input type="checkbox" class="chk" data-sheet="${r.sheetName}" data-row="${r.row}">
        ${r.rideDate}　${r.place}（${r.sheetName}）
      </label>
    `;

    list.appendChild(div);
  });

  // ★ キャンセル実行
  document.getElementById("cancelBtn").onclick = async () => {
    const checks = document.querySelectorAll(".chk:checked");

    if (checks.length === 0) {
      alert("キャンセルする予約を選択してください。");
      return;
    }

    const targets = [];
    checks.forEach(c => {
      targets.push({
        sheetName: c.dataset.sheet,
        row: Number(c.dataset.row)
      });
    });

    await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "cancelExec",
        userId: userId,
        targets: targets
      })
    });

    alert("キャンセルが完了しました。");
    liff.closeWindow();
  };
}

main();


