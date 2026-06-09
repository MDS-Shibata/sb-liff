
const GAS_URL = "https://script.google.com/macros/s/AKfycbzgPtP27CdcdNJ3zD47X6JaVjSN9Q7TtDoJuGTNLhM_XxZtae1-rW8lLyp3gmi8j2Pr/exec";

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

  // ◯ 修正後（URLの後ろにパラメーターとしてくっつけてPOSTする）
const url = `${GAS_URL}?mode=cancel&userId=${encodeURIComponent(userId)}`;
const res = await fetch(url, {
    method: "POST"
});
/*const data = await res.json();

  

  const reservations = await res.json();*/

  /* ==================================================
   ▼ ここから：検証用の新しいコード
===================================================== */
// 変数名を下の処理（reservations.lengthなど）と合わせるため、
// ここで1回だけ「reservations」という名前でデータを受け取ります
const reservations = await res.json(); 

console.log("GASから届いたデータ:", reservations);
/* ==================================================
   ▲ ここまで検証用コード
===================================================== */
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


