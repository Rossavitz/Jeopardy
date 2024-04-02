// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]
const body = document.body;
const h1 = document.createElement("h1");
h1.innerText = "Jeopardy!";
/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

//access categories, this returns an array of objects with id, title and cluecount.
//pick 6 of the data objects (now categories), loop over them, access id of each index, push that id into idArray
async function getCategoryIds() {
  let response = await axios.get(
    "https://rithm-jeopardy.herokuapp.com/api/categories?count=100"
  );
  // console.log(response);
  let NUM_CATEGORIES = _.sampleSize(response.data, [(n = 6)]);
  idArray = [];
  for (let i = 0; i < NUM_CATEGORIES.length; i++) {
    let catId = NUM_CATEGORIES[i].id;
    idArray.push(catId);
  }
  return idArray;
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

//for each id in ID array, access the API
async function processId(id) {
  let response = await axios.get(
    `https://rithm-jeopardy.herokuapp.com/api/category?id=${id}`
  );
  clue = {
    title: response.data.title, //grab title from every response.
    clues: clueArray, //fill clues with clueArray data from clues loop below
  };
  for (let i = 0; i < response.data.clues.length; i++) {
    //In each response loop through clues array. take question/answer and put into clueArray.
    clueArray.push({
      question: response.data.clues[i].question, //pulls question
      answer: response.data.clues[i].answer, //pulls answer
      showing: null, //showing: null so we can later change to showing question/answer
    });
  }
  categories.push(clue); //push clue into categories
  clueArray = []; //empty clueArray for next loop
}

async function getCategory(idArray) {
  //use ID array to get category
  categories = [];
  clueArray = [];
  for (const id of idArray) {
    //for every Id, process id.
    await processId(id);
  }
  return categories; //returns categories array
}

/**
 *  Fill the HTML table #jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

//create table head
const tblHead = document.createElement("thead");
function createThead(categories) {
  const thRow = document.createElement("tr"); //create table row for table head

  for (let i = 0; i < categories.length; i++) {
    //dynamically loop through category length for # of cells for category titles
    const cell = document.createElement("td"); //create those cells
    const catTitle = document.createTextNode(categories[i].title.toUpperCase()); //give those cells text based on category titles, all uppercase
    cell.appendChild(catTitle);
    thRow.appendChild(cell);
  }
  tblHead.appendChild(thRow); //appended all together
}

//create table body
const tblBody = document.createElement("tbody");
function createTableBody(categories) {
  cellIndex = 0; //cell index to 0
  rowIndex = 0; //row index to 0
  for (let i = 0; i < categories[i].clues.length; i++) {
    //dynamically add rows based on clue arrays length
    const row = document.createElement("tr");

    for (let j = 0; j < categories.length; j++) {
      //dynamically add cells based on num of categories
      const cell = document.createElement("td"); //create cell
      const cellText = document.createTextNode("?"); //give cell starter text
      cell.id = rowIndex + cellIndex; //dynamically assigning id to every cell
      cellIndex = cellIndex + 5; //adding 5 to cell index, this is to number top to bottom instead of left to right.
      cell.appendChild(cellText);
      row.appendChild(cell);
      cell.addEventListener("click", handleClick); //adding event listener to cells
    }
    cellIndex = 0; //reset cell index to 0
    rowIndex++; //add one to row index
    tblBody.appendChild(row);
  }
}
//*** Cell/row index created to easier assign what category/question/answer goes with each cell.

//fillTable relies on 2 other functions to create the table.
// Await those functions. Create the table, append the table, create and add head then body, append.
async function fillTable() {
  const categoryIds = await getCategoryIds();
  const categories = await getCategory(categoryIds);
  const tbl = document.createElement("table");
  document.body.appendChild(tbl);
  createThead(categories);
  createTableBody(categories);
  tbl.appendChild(tblHead);
  tbl.appendChild(tblBody);
}

/**
 * Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

//click event. setting up corresponding indexes, then logic.
function handleClick(e) {
  target = e.target;
  column = Math.floor(target.id / 5);
  row = target.id - Math.floor(target.id / 5) * 5;
  arrIdx = categories[column].clues[row]; //column/row/arrIdx created to correspond every cell with a categories and clues index. it assures categories/questions/answers all fit in the same column/row/location that we want.
  if (arrIdx.showing === null) {
    //logic to say: on click if null, change text to question, showing to question.
    target.innerText = arrIdx.question;
    arrIdx.showing = "question";
  } else if (arrIdx.showing === "question") {
    //on click if questions, change text to answer, showing to answer.
    target.innerText = arrIdx.answer;
    arrIdx.showing = "answer";
    target.classList.add("answer"); //also add class of "answer". this lets us target with CSS to change background color
  }
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

// function showLoadingView() {}

/** Remove the loading spinner and update the button used to fetch data. */

// function hideLoadingView() {}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
  await fillTable(); //awaiting fillTable
}
setupAndStart(); //starts game on page open

const startBtn = document.createElement("button"); //create button for new game
startBtn.textContent = "New Game!";
body.prepend(startBtn); //append
body.prepend(h1);

startBtn.addEventListener("click", function () {
  //start button event listener
  location.reload(); //reload page on click, which in turn starts a new game as it runs on page open.
});
