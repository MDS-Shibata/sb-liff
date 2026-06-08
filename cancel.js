<script>
const GAS_URL = "https://script.google.com/macros/s/AKfycbwNg8enfIxub1JQuAS_ytiRB9TmBeCn_Kyb0JQ0guvTt-XjvMZ8X4AONGfp7CUrU856/exec";

async function main() {
  await liff.init({ liffId: "2010140886-GXbWv0ge" });

  const userId = liff.getContext().userId;

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
</script>

