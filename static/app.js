let currentCase = null;
const practiceExercises = [
  {
    mission: "ค้นหาชื่อจากตาราง people ที่มี id เป็น 2",
    answer: ["SELECT", "name", "FROM", "people", "WHERE", "id = 2"],
    blocks: [["FROM","keyword"],["id = 2","condition"],["SELECT","keyword"],["people","table"],["WHERE","keyword"],["name","field"]],
    table: {name: "people", columns: ["id", "name"], rows: [[1, "Lumo"], [2, "Nami"], [3, "Kira"]]},
    output: {columns: ["name"], rows: [["Nami"]]}
  },
  {
    mission: "ค้นหา action จากตาราง events ที่ item เป็น Red notebook",
    answer: ["SELECT", "action", "FROM", "events", "WHERE", "item = 'Red notebook'"],
    blocks: [["events","table"],["WHERE","keyword"],["SELECT","keyword"],["item = 'Red notebook'","condition"],["action","field"],["FROM","keyword"]],
    table: {name: "events", columns: ["id", "person", "action", "item"], rows: [[1, "Milo", "opened", "Red notebook"], [2, "Aira", "borrowed", "Red notebook"], [3, "Zen", "ignored", "Blue folder"]]},
    output: {columns: ["action"], rows: [["opened"], ["borrowed"]]}
  },
  {
    mission: "ค้นหาชื่อคนจาก people และเรียงตามชื่อ",
    answer: ["SELECT", "name", "FROM", "people", "ORDER BY", "name"],
    blocks: [["ORDER BY","keyword"],["people","table"],["name","field"],["SELECT","keyword"],["name","field"],["FROM","keyword"]],
    table: {name: "people", columns: ["id", "name"], rows: [[3, "Vela"], [1, "Rune"], [2, "Mali"]]},
    output: {columns: ["name"], rows: [["Mali"], ["Rune"], ["Vela"]]}
  }
];
let currentExercise = 0;
let practiceSelection = [];
let practiceCompleted = JSON.parse(localStorage.getItem("sql-detective-practice-completed") || "[]");
if(!Array.isArray(practiceCompleted)) practiceCompleted = practiceCompleted ? [0] : [];
const savedPracticeAnswers = JSON.parse(localStorage.getItem("sql-detective-practice-answers") || "{}");
const solvedCases = new Set(JSON.parse(localStorage.getItem("sql-detective-solved") || "[]"));
const $ = (s) => document.querySelector(s);

function openTutorial(){ $("#tutorialModal").hidden = false; }
function closeTutorial(){ $("#tutorialModal").hidden = true; }
function startTutorial(){
  closeTutorial();
  $("#homeScreen").classList.remove("active");
  $("#caseScreen").classList.remove("active");
  $("#practiceScreen").classList.add("active");
  resetPractice();
  window.scrollTo({top:0, behavior:"smooth"});
}

function renderPracticeBlocks(){
  const bank = $("#practiceBlocks");
  bank.innerHTML = "";
  practiceExercises[currentExercise].blocks.forEach(([text,type]) => {
    const block = makeBlock(text, type);
    block.onclick = () => choosePracticeBlock(text);
    bank.appendChild(block);
  });
}

function getPracticeSelection(){
  return [...$("#practiceQuery").querySelectorAll(".query-block")].map(block => block.dataset.text);
}

function addPracticeBlock(text, before=null){
  $("#practiceQuery .drop-placeholder")?.remove();
  const original = practiceExercises[currentExercise].blocks.find(block => block[0] === text);
  const block = makeBlock(text, original ? original[1] : "", true);
  block.querySelector(".remove").onclick = e => {
    e.stopPropagation();
    block.remove();
    practiceSelection = getPracticeSelection();
    if(!$("#practiceQuery").querySelector(".query-block")) $("#practiceQuery").innerHTML = '<span class="drop-placeholder">ลากบล็อก SQL มาวางที่นี่…</span>';
    $("#practiceFeedback").textContent = "ลบบล็อกแล้ว ปรับคำตอบต่อได้เลย";
    savePracticeAnswer();
  };
  block.addEventListener("dragend", savePracticeAnswer);
  $("#practiceQuery").insertBefore(block, before);
}

function renderPracticeEvidence(){
  const table = practiceExercises[currentExercise].table;
  $("#practiceEvidence").innerHTML = `<div class="evidence-name">TABLE: ${escapeHtml(table.name)}</div><div class="table-scroll"><table><thead><tr>${table.columns.map(column => `<th>${escapeHtml(column)}</th>`).join("")}</tr></thead><tbody>${table.rows.map(row => `<tr>${row.map(value => `<td>${escapeHtml(value)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}

function selectExercise(index){
  currentExercise = index;
  $("#practiceMission").textContent = practiceExercises[index].mission;
  document.querySelectorAll(".exercise-choice").forEach((button, buttonIndex) => {
    button.classList.toggle("active", buttonIndex === index);
    button.classList.toggle("completed", practiceCompleted.includes(buttonIndex));
  });
  resetPractice();
}

function choosePracticeBlock(text){
  addPracticeBlock(text);
  practiceSelection = getPracticeSelection();
  savePracticeAnswer();
  $("#practiceFeedback").textContent = "เพิ่มบล็อกแล้ว ลองประกอบต่อได้เลย";
  $("#practiceFeedback").className = "muted";
}

function resetPractice(){
  practiceSelection = savedPracticeAnswers[currentExercise] ? [...savedPracticeAnswers[currentExercise]] : [];
  $("#practiceQuery").innerHTML = '<span class="drop-placeholder">ลากบล็อก SQL มาวางที่นี่…</span>';
  practiceSelection.forEach(text => addPracticeBlock(text));
  if(practiceSelection.length) $("#practiceQuery .drop-placeholder")?.remove();
  $("#practiceFeedback").textContent = practiceCompleted.includes(currentExercise) ? "เคยผ่านแบบฝึกนี้แล้ว สามารถปรับคำตอบได้" : "ลากบล็อกมาวางในกรอบ";
  $("#practiceFeedback").className = "muted";
  $("#practiceResult").hidden = true;
  $("#practiceNext").hidden = true;
  $("#practiceBlocks").classList.remove("complete");
  renderPracticeBlocks();
  renderPracticeEvidence();
}

function savePracticeAnswer(){
  practiceSelection = getPracticeSelection();
  savedPracticeAnswers[currentExercise] = [...practiceSelection];
  localStorage.setItem("sql-detective-practice-answers", JSON.stringify(savedPracticeAnswers));
}

function clearPracticeAnswer(){
  practiceSelection = [];
  delete savedPracticeAnswers[currentExercise];
  localStorage.setItem("sql-detective-practice-answers", JSON.stringify(savedPracticeAnswers));
  $("#practiceQuery").innerHTML = '<span class="drop-placeholder">ลากบล็อก SQL มาวางที่นี่…</span>';
  $("#practiceFeedback").textContent = "ล้างคำตอบแล้ว ลองประกอบใหม่ได้เลย";
  $("#practiceFeedback").className = "muted";
  $("#practiceResult").hidden = true;
  $("#practiceNext").hidden = true;
}

$("#practiceQuery").addEventListener("dragover", e => {
  e.preventDefault();
  $("#practiceQuery").classList.add("dragover");
  const dragging = $("#practiceQuery .query-block.dragging");
  if(dragging){
    const after = getDragAfterElement($("#practiceQuery"), e.clientX, e.clientY);
    if(after == null) $("#practiceQuery").appendChild(dragging);
    else $("#practiceQuery").insertBefore(dragging, after);
  }
});
$("#practiceQuery").addEventListener("dragleave", () => $("#practiceQuery").classList.remove("dragover"));
$("#practiceQuery").addEventListener("drop", e => {
  e.preventDefault();
  $("#practiceQuery").classList.remove("dragover");
  const text = e.dataTransfer.getData("text/plain");
  const dragging = $("#practiceQuery .query-block.dragging");
  if(text && !dragging){
    const before = getDragAfterElement($("#practiceQuery"), e.clientX, e.clientY);
    addPracticeBlock(text, before);
  }
  practiceSelection = getPracticeSelection();
  savePracticeAnswer();
});
$("#practiceBlocks").addEventListener("dragstart", e => {
  if(e.target.classList.contains("sql-block")) e.dataTransfer.setData("text/plain", e.target.dataset.text);
});

function showHome(){
  $("#caseScreen").classList.remove("active");
  $("#practiceScreen").classList.remove("active");
  $("#homeScreen").classList.add("active");
  window.scrollTo({top:0, behavior:"smooth"});
}

function updateProgress(){
  const caseIds = Object.keys(window.CASES);
  const solved = caseIds.filter(id => solvedCases.has(id)).length;
  const completed = solved + practiceCompleted.length;
  const total = caseIds.length + practiceExercises.length;
  $("#progressText").textContent = `${completed} / ${total} MISSIONS COMPLETE`;
  $("#progressBar").style.width = `${completed / total * 100}%`;
  document.querySelectorAll(".case-card").forEach(card => {
    card.classList.toggle("locked", practiceCompleted.length < practiceExercises.length);
    const action = card.querySelector(".card-action");
    action.textContent = practiceCompleted.length < practiceExercises.length ? "LOCKED // COMPLETE TUTORIAL" : "OPEN CASE →";
    if(solvedCases.has(card.dataset.case)){
      card.classList.add("solved");
      if(!card.querySelector(".solved-badge")){
        const badge = document.createElement("span");
        badge.className = "solved-badge";
        badge.textContent = "✓ SOLVED";
        card.appendChild(badge);
      }
    }else{
      card.classList.remove("solved");
      card.querySelector(".solved-badge")?.remove();
    }
  });
}

function updateCaseNavigation(){
  const caseIds = Object.keys(window.CASES);
  const currentIndex = caseIds.indexOf(currentCase.id);
  $("#casePosition").textContent = `CASE ${currentIndex + 1} / ${caseIds.length}`;
  $("#previousCaseBtn").disabled = currentIndex <= 0;
  $("#nextQuestionBtn").disabled = currentIndex >= caseIds.length - 1;
  $("#previousCaseBtn").onclick = () => {
    if(currentIndex > 0) openCase(caseIds[currentIndex - 1]);
  };
  $("#nextQuestionBtn").onclick = () => {
    if(currentIndex < caseIds.length - 1) openCase(caseIds[currentIndex + 1]);
  };
}

function openCase(id){
  if(practiceCompleted.length < practiceExercises.length){
    startTutorial();
    return;
  }
  currentCase = window.CASES[id];
  currentCase.id = id;
  updateCaseNavigation();
  $("#homeScreen").classList.remove("active");
  $("#caseScreen").classList.add("active");
  $("#caseLabel").textContent = `${id.toUpperCase()} // CLASSIFIED`;
  $("#caseTitle").textContent = currentCase.title;
  $("#caseIcon").textContent = currentCase.icon;
  $("#caseStory").textContent = currentCase.story;
  $("#caseObjective").textContent = currentCase.objective;
  $("#caseGuide").textContent = currentCase.guide;
  $("#resultOrder").textContent = currentCase.result_order;
  $("#caseHint").textContent = currentCase.hint;
  renderSchema(id);
  renderEvidenceTables();
  renderBlocks();
  clearQuery();
  window.scrollTo({top:0, behavior:"smooth"});
}

function renderSchema(id){
  const schemas = {
    case1: `<div class="schema-table"><b>people</b> (id, name)</div><div class="schema-table"><b>events</b> (id, person_id, action, item, location)</div>`,
    case2: `<div class="schema-table"><b>events</b> (id, person_id, action, item, location)</div>`,
    case3: `<div class="schema-table"><b>students</b> (id, name)</div><div class="schema-table"><b>card_scans</b> (id, name, location, scan_time)</div>`
  };
  $("#schemaText").innerHTML = schemas[id];
}

function renderEvidenceTables(){
  const container = $("#evidenceTables");
  container.innerHTML = "";
  Object.entries(currentCase.tables).forEach(([tableName, table]) => {
    const section = document.createElement("div");
    section.className = "evidence-table";
    const title = document.createElement("div");
    title.className = "evidence-name";
    title.textContent = `TABLE: ${tableName}`;
    const scroll = document.createElement("div");
    scroll.className = "table-scroll";
    const tableElement = document.createElement("table");
    const head = document.createElement("thead");
    head.innerHTML = `<tr>${table.columns.map(column => `<th>${escapeHtml(column)}</th>`).join("")}</tr>`;
    const body = document.createElement("tbody");
    table.rows.forEach(row => {
      const tr = document.createElement("tr");
      tr.innerHTML = row.map(value => `<td>${escapeHtml(value)}</td>`).join("");
      body.appendChild(tr);
    });
    tableElement.append(head, body);
    scroll.appendChild(tableElement);
    section.append(title, scroll);
    container.appendChild(section);
  });
}

function makeBlock(text, type, query=false){
  const el = document.createElement("div");
  el.className = `sql-block ${type || ""} ${query ? "query-block" : ""}`;
  el.draggable = true;
  el.dataset.text = text;
  el.innerHTML = `${escapeHtml(text)}${query ? '<button type="button" class="remove" aria-label="ลบบล็อก SQL">×</button>' : ''}`;
  el.addEventListener("dragstart", e => {
    e.dataTransfer.setData("text/plain", text);
    el.classList.add("dragging");
  });
  el.addEventListener("dragend", () => el.classList.remove("dragging"));
  if(query) el.querySelector(".remove").onclick = e => {
    e.stopPropagation();
    el.remove();
  };
  return el;
}

function renderBlocks(){
  const bank = $("#blockBank");
  bank.innerHTML = "";
  currentCase.blocks.forEach(([text,type]) => bank.appendChild(makeBlock(text,type,false)));
}

function clearQuery(){
  $("#queryDrop").innerHTML = '<div class="drop-placeholder">ลากบล็อก SQL มาวางที่นี่…</div>';
  $("#resultContent").className = "result-content empty";
  $("#resultContent").textContent = "กด RUN QUERY เพื่อดูผลลัพธ์";
  $("#resultStatus").textContent = "รอการรัน";
}

function addQueryBlock(text, before=null){
  $("#queryDrop .drop-placeholder")?.remove();
  const original = currentCase.blocks.find(b => b[0] === text);
  const block = makeBlock(text, original ? original[1] : "", true);
  $("#queryDrop").insertBefore(block, before);
}

$("#queryDrop").addEventListener("dragover", e => {e.preventDefault(); $("#queryDrop").classList.add("dragover")});
$("#queryDrop").addEventListener("dragleave", () => $("#queryDrop").classList.remove("dragover"));
$("#queryDrop").addEventListener("drop", e => {
  e.preventDefault();
  $("#queryDrop").classList.remove("dragover");
  const text = e.dataTransfer.getData("text/plain");
  const dragging = $("#queryDrop .query-block.dragging");
  if(text && !dragging){
    const before = getDragAfterElement($("#queryDrop"), e.clientX, e.clientY);
    addQueryBlock(text, before);
  }
});

$("#blockBank").addEventListener("dragstart", e => {
  if(e.target.classList.contains("sql-block")) e.dataTransfer.setData("text/plain", e.target.dataset.text);
});

$("#blockBank").addEventListener("click", e => {
  const block = e.target.closest(".sql-block");
  if(block) addQueryBlock(block.dataset.text);
});

$("#queryDrop").addEventListener("dragstart", e => {
  if(e.target.classList.contains("query-block")) e.dataTransfer.setData("text/plain", e.target.dataset.text);
});

$("#queryDrop").addEventListener("dragover", e => {
  e.preventDefault();
  const dragging = $("#queryDrop .query-block.dragging");
  if(dragging){
    const after = getDragAfterElement($("#queryDrop"), e.clientX, e.clientY);
    if(after == null) $("#queryDrop").appendChild(dragging);
    else $("#queryDrop").insertBefore(dragging, after);
  }
});

function getDragAfterElement(container, x, y){
  const els = [...container.querySelectorAll(".query-block:not(.dragging)")];
  if(!els.length) return null;

  const rows = [];
  els.forEach(element => {
    const box = element.getBoundingClientRect();
    let row = rows.find(candidate => Math.abs(candidate.top - box.top) < 4);
    if(!row){
      row = {top:box.top, bottom:box.bottom, elements:[]};
      rows.push(row);
    }
    row.bottom = Math.max(row.bottom, box.bottom);
    row.elements.push({element, box});
  });

  const rowIndex = rows.findIndex(row => y <= row.bottom);
  if(rowIndex === -1) return null;

  const row = rows[rowIndex];
  const nextInRow = row.elements.find(({box}) => x < box.left + box.width / 2);
  if(nextInRow) return nextInRow.element;

  return rows[rowIndex + 1]?.elements[0]?.element || null;
}

$("#runBtn").onclick = async () => {
  const blocks = [...$("#queryDrop").querySelectorAll(".query-block")];
  const sql = blocks.map(b => b.dataset.text).join(" ").trim();
  if(!sql){ showResult(false, "ยังไม่มี SQL ให้รัน"); return; }

  $("#resultStatus").textContent = "กำลังรัน…";
  try{
    const res = await fetch("/api/run", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({case: currentCase.id, sql})
    });
    const data = await res.json();
    if(!data.ok){ showResult(false, data.error, true); return; }
    showResult(data.correct, data.message, false, data);
  }catch(err){ showResult(false, "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้: " + err.message, true); }
};

function showResult(correct, message, error=false, data=null){
  $("#resultStatus").textContent = correct ? "CASE SOLVED" : error ? "SQL ERROR" : "TRY AGAIN";
  $("#resultContent").className = "result-content";
  let html = `<div class="${error ? "error" : correct ? "success" : "failure"}">${escapeHtml(message)}</div>`;
  if(data && data.columns){
    if(data.rows.length){
      html += `<table><thead><tr>${data.columns.map(c=>`<th>${escapeHtml(c)}</th>`).join("")}</tr></thead><tbody>`;
      data.rows.forEach(row => {
        html += `<tr>${data.columns.map(c=>`<td>${escapeHtml(row[c])}</td>`).join("")}</tr>`;
      });
      html += "</tbody></table>";
    }else{
      html += `<p class="muted">Query รันสำเร็จ แต่ไม่พบข้อมูล</p>`;
    }
  }
  $("#resultContent").innerHTML = html;
  if(correct){
    solvedCases.add(currentCase.id);
    localStorage.setItem("sql-detective-solved", JSON.stringify([...solvedCases]));
    updateProgress();
    if(solvedCases.size === Object.keys(window.CASES).length){
      $("#completionModal").hidden = false;
    }
  }
}

$("#clearBtn").onclick = clearQuery;
$("#backBtn").onclick = () => {
  $("#caseScreen").classList.remove("active");
  $("#homeScreen").classList.add("active");
};

$("#completionHomeBtn").onclick = () => {
  $("#completionModal").hidden = true;
  showHome();
};

$("#tutorialBtn").onclick = openTutorial;
$("#heroTutorialBtn").onclick = openTutorial;
$("#closeTutorialBtn").onclick = closeTutorial;
$("#closeTutorialSecondaryBtn").onclick = closeTutorial;
$("#startTutorialBtn").onclick = startTutorial;
$("#practiceBackBtn").onclick = showHome;
$("#practiceCasesBtn").onclick = () => {
  if(currentExercise < practiceExercises.length - 1){
    selectExercise(currentExercise + 1);
    $("#practiceMission").scrollIntoView({behavior:"smooth", block:"center"});
  }else{
    showHome();
  }
};
$("#practiceResetBtn").onclick = clearPracticeAnswer;
$("#practiceCheckBtn").onclick = () => {
  const result = $("#practiceResult");
  result.hidden = false;
  const answer = practiceExercises[currentExercise].answer;
  practiceSelection = getPracticeSelection();
  savePracticeAnswer();
  const isCorrect = practiceSelection.length === answer.length && practiceSelection.every((block, index) => block === answer[index]);
  if(isCorrect){
    result.className = "practice-result success";
    if(!practiceCompleted.includes(currentExercise)) practiceCompleted.push(currentExercise);
    result.textContent = practiceCompleted.length === practiceExercises.length ? "ผ่าน Tutorial ครบแล้ว! คุณพร้อมไปลองไขคดีจริงแล้ว" : `ผ่านแบบฝึกนี้แล้ว เหลืออีก ${practiceExercises.length - practiceCompleted.length} ข้อ`;
    const output = practiceExercises[currentExercise].output;
    result.innerHTML = `<div class="practice-success-message">${escapeHtml(result.textContent)}</div><div class="practice-output-title">QUERY OUTPUT</div><table><thead><tr>${output.columns.map(column => `<th>${escapeHtml(column)}</th>`).join("")}</tr></thead><tbody>${output.rows.map(row => `<tr>${row.map(value => `<td>${escapeHtml(value)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
    localStorage.setItem("sql-detective-practice-completed", JSON.stringify(practiceCompleted));
    $("#practiceNextText").textContent = currentExercise < practiceExercises.length - 1 ? "พร้อมไปข้อต่อไปไหม?" : "Tutorial ครบแล้ว!";
    $("#practiceCasesBtn").textContent = currentExercise < practiceExercises.length - 1 ? "ข้อต่อไป →" : "ไปเลือกคดีจริง →";
    $("#practiceNext").hidden = false;
    updateProgress();
  }else{
    result.className = "practice-result failure";
    const missingBlocks = practiceExercises[currentExercise].answer.length - practiceSelection.length;
    result.textContent = missingBlocks > 0 ? `ยังไม่ครบ ลองเลือกอีก ${missingBlocks} บล็อก` : "คำตอบยังไม่ถูก ลองตรวจสอบลำดับของบล็อกอีกครั้ง";
    $("#practiceNext").hidden = true;
  }
};
document.querySelectorAll(".exercise-choice").forEach(button => {
  button.onclick = () => selectExercise(Number(button.dataset.exercise));
});
$("#tutorialModal").onclick = e => {
  if(e.target === $("#tutorialModal")) closeTutorial();
};

document.querySelectorAll(".case-card").forEach(card => {
  card.onclick = () => openCase(card.dataset.case);
});

$("#resetProgressBtn").onclick = () => {
  if(!confirm("เริ่มความคืบหน้าใหม่ทั้งหมดใช่ไหม?")) return;
  solvedCases.clear();
  practiceCompleted = [];
  localStorage.removeItem("sql-detective-solved");
  localStorage.removeItem("sql-detective-practice-completed");
  Object.keys(savedPracticeAnswers).forEach(key => delete savedPracticeAnswers[key]);
  localStorage.removeItem("sql-detective-practice-answers");
  updateProgress();
};

updateProgress();
renderPracticeBlocks();
document.querySelectorAll(".exercise-choice").forEach((button, index) => button.classList.toggle("completed", practiceCompleted.includes(index)));

function escapeHtml(value){
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}
