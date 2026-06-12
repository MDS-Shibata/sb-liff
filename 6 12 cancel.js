// const GAS_URL = "https://script.google.com/macros/s/AKfycbwsJ7SEDmz1MDsFUQNAS2CduVCLKA3LojxYPV4WJnm_nIapXMog2BgvPwERucJC52wx/exec";

// async function main() {
//   // 1. LINEのLIFFを初期化
//   await liff.init({ liffId: "2010140886-GXbWv0ge" });

//   // 2. index.html のURLから引き継いだ userId を取得
//   const params = new URLSearchParams(window.location.search);
//   let userId = params.get("userId");

//   // 3. もしURLから取得できなかった場合の予備の安全策
//   if (!userId) {
//     const profile = await liff.getProfile();
//     userId = profile.userId;
//   }

//   // デバッグログ
//   console.log("userId=", userId);
//   console.log("送信データ=", JSON.stringify({ mode: "cancel", userId: userId }));

//   // 4. GASから予約一覧を取得
//   const res = await fetch(GAS_URL, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//       mode: "cancel",
//       userId: userId
//     })
//   });

//   // 5. GASから届いたデータをJSONとして受け取る
//   const reservations = await res.json(); 
//   console.log("GASから届いたデータ:", reservations);
  
//   // 6. ローディングの表示を停止
//   document.getElementById("loading").style.display = "none";

//   // 7. 表の枠（ヘッダー部分）を作成
//   const list = document.getElementById("list");
//   list.innerHTML = `
//     <div style="margin-bottom: 40px;font-size: 40px;">
//       <h3 style="background:#7fffd4; padding:10px;">登校予約</h3>
//       <table border="1" style="width:100%; border-collapse:collapse;">  
//         <thead>
//           <tr style="background:#f8f8f8;">
//                <th style="font-weight:300; font-size:30px;">✓</th>      
//                <th style="font-weight:300; font-size:30px;">乗車日</th>
//                <th style="font-weight:300; font-size:30px;">車校着</th>
//                <th style="font-weight:300; font-size:30px;">乗車バス停</th>
//           </tr>
//         </thead>
//         <tbody id="toSchoolList"></tbody>
//       </table>
//     </div>

//     <div style="margin-bottom: 40px;font-size: 40px;">
//       <h3 style="background:#87cefa; padding:10px;">下校予約</h3>
//       <table border="1" style="width:100%; border-collapse:collapse;">
//         <thead>
//           <tr style="background:#f8f8f8;">
//                <th style="font-weight:300; font-size:30px;">✓</th>      
//                <th style="font-weight:300; font-size:30px;">乗車日</th>
//                <th style="font-weight:300; font-size:30px;">車校発</th>
//                <th style="font-weight:300; font-size:30px;">降車バス停</th>
//           </tr>
//         </thead>
//         <tbody id="fromSchoolList"></tbody>
//       </table>
//     </div>
//   `;

//   const toSchoolList = document.getElementById("toSchoolList");
//   const fromSchoolList = document.getElementById("fromSchoolList");

//   // 8. データを表の行（明細）に追加
//   reservations.forEach((r) => {
//     const row = document.createElement("tr");
//     row.innerHTML = `
//       <td><input type="checkbox" class="chk" data-sheet="${r.sheetName}" data-row="${r.row}"></td>
//       <td>${r.rideDate}</td>
//       <td>${r.time || ""}</td>
//       <td>${r.place}</td>
//     `;

//     if (r.sheetName.includes("登校")) {
//       toSchoolList.appendChild(row);
//     } else if (r.sheetName.includes("下校")) {
//       fromSchoolList.appendChild(row);
//     }
//   });

//   // ★ チェックした行を赤くする
//   document.addEventListener("change", (e) => {
//     if (e.target.classList.contains("chk")) {
//       const tr = e.target.closest("tr");
//       if (e.target.checked) {
//         tr.classList.add("tr-selected");
//       } else {
//         tr.classList.remove("tr-selected");
//       }
//     }
//   });

//   // 9. 予約が1件もない場合の表示
//   if (reservations.length === 0) {
//     list.innerHTML = "現在キャンセルできる予約はありません。";
//     return;
//   }

//   // ★ キャンセルボタンを押した時の実行処理
//   document.getElementById("cancelBtn").onclick = async () => {
//     const checks = document.querySelectorAll(".chk:checked");

//     if (checks.length === 0) {
//       alert("キャンセルする予約を選択してください。");
//       return;
//     }

//     // 画面を一時的に「処理中」の表示に切り替える
//     document.getElementById("list").style.display = "none";
//     document.getElementById("cancelBtn").style.display = "none";
//     document.getElementById("loading").style.display = "block";

//     const targets = [];
//     checks.forEach(c => {
//       targets.push({
//         sheetName: c.dataset.sheet,
//         row: Number(c.dataset.row)
//       });
//     });

//     try {
//       const res = await fetch(GAS_URL, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           mode: "cancelExec",
//           userId: userId,
//           targets: targets
//         })
//       });

//       const json = await res.json();

//       if (json.success) {
//         alert("キャンセルが完了しました。");
//         liff.closeWindow(); // LINEのLIFFウインドウを閉じる
//       } else {
//         alert("キャンセルに失敗しました。");
//       }

//     } catch (err) {
//       alert("通信エラーが発生しました。");
//     }

//     // 失敗時のみ画面を元に戻す
//     document.getElementById("list").style.display = "block";
//     document.getElementById("cancelBtn").style.display = "block";
//     document.getElementById("loading").style.display = "none";
//   };
  
// }

// window.onload = main;
