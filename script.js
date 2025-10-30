// FUNCTIONALITY TO LOAD ALL THE FLAT COCTAIL OBJECTS INTO AN ARRAY

// The url only allows to grab an array of coctails with their first name
const baseUrl = "https://www.thecocktaildb.com/api/json/v1/1/search.php?f=";
const alphabet = [..."abcdefghijklmnopqrstuvwxyz"];
// FETCHING FUNCTION (CALLED 26 TIMES)
async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.log("Fetching HTTP error:", response.status, response.statusText);
      return;
    }
    const cocktailData = await response.json();
    if (cocktailData.drinks && cocktailData.drinks.length > 0) {
      return cocktailData;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}
// HELPER FUNCTION: GRAB COCTAILS BY THE FIRST LETTER
async function fetchCoctailsByFirstLetter(firstLetter) {
  return await fetchData(baseUrl + firstLetter);
}
// ADD ALL THE FETCHING PROMISES INTO AN ARRAY FOR EACH LETTER OF ALPHABET
const allCocktailsPromises = alphabet.map((l) => fetchCoctailsByFirstLetter(l));

// SORT ALL THE PROMISES: GET ONLY THE FLAT COCTAIL OBJECTS
async function getAllCocktails() {
  try {
    const allResults = await Promise.all(allCocktailsPromises);
    const cocktailsArray = [];

    allResults.forEach((result) => {
      if (result && result.drinks) {
        cocktailsArray.push(...result.drinks);
      }
    });
    return cocktailsArray;
  } catch (error) {
    console.error("Error getting all cocktails:", error);
    return [];
  }
}
//  ARRAY WITH ALL THE FLAT COCTAIL OBJECTS
let coctailDB = [];

// GENERATING A RANDOM COCTAIL, RETURNIN DOM ELEMENT
function generateRandomCoctail(array) {
  const randomCoctail = getRandomCoctail(array);
  const randomCoctailCard = createCoctailCard(randomCoctail);
  return randomCoctailCard;
}
// RETURNING A RANDOM COCTAIL
function getRandomCoctail(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// ===== RENDERING PAGES FUNCTIONALITY =====

// RENDER MAIN PAGE
function renderLandingPage() {
  const root = document.getElementById("root");
  const clone = document
    .getElementById("landingPageTpl")
    .content.cloneNode(true);

  const randomCoctailWrapper = clone.querySelector(
    ".randomCoctailPresentation"
  );
  const randomCoctaiLBtn = clone.querySelector("button");

  const displayRandomCoctail = () => {
    randomCoctailWrapper.innerHTML = "";
    let randomCoctail = generateRandomCoctail(coctailDB);
    randomCoctailWrapper.appendChild(randomCoctail);
  };
  randomCoctaiLBtn.addEventListener("click", (e) => {
    displayRandomCoctail();
  });
  displayRandomCoctail();

  root.innerHTML = "";
  root.appendChild(clone);
  initialiseSearch();
}

// CREATE COCTAIL PREVIEW CARD
function createCoctailCard(coctailObj) {
  const clone = document
    .getElementById("coctailPreviewTpl")
    .content.cloneNode(true);
  clone.querySelector("img").src = coctailObj.strDrinkThumb;
  clone.querySelector("h5").innerText = coctailObj.strDrink;

  const spanElement = clone.querySelector("span");
  if (spanElement) {
    spanElement.innerHTML = `<strong>Short description:</strong> <br/>
        Drink type: ${coctailObj.strAlcoholic} <br/>
        Main ingredients: ${
          coctailObj.strIngredient1 ? coctailObj.strIngredient1 : "Love"
        }, ${coctailObj.strIngredient2 ? coctailObj.strIngredient2 : "Love"}, ${
      coctailObj.strIngredient3 ? coctailObj.strIngredient3 : "Love"
    }.`; // Fixed: typo "ingridients" -> "ingredients"
  }

  clone.querySelector("button").addEventListener("click", (e) => {
    renderDetailedInfo(coctailObj);
  });
  return clone;
}

// RENDER A DETAILED COCTAIL INFO PAGE
function renderDetailedInfo(coctailObj) {
  const root = document.getElementById("root");
  root.innerHTML = "";

  const template = document.getElementById("CoctailDetailedImfoTpl");
  const clone = template.content.cloneNode(true);

  //  BASIC INFO
  const cocktailImage = clone.querySelector(".cocktail-image-large");
  const cocktailName = clone.querySelector(".cocktail-name");
  const cocktailCategory = clone.querySelector(".cocktail-category");
  const cocktailType = clone.querySelector(".cocktail-type");
  const cocktailGlass = clone.querySelector(".cocktail-glass");

  if (cocktailImage) {
    cocktailImage.src = coctailObj.strDrinkThumb || "";
  }
  cocktailName.textContent = coctailObj.strDrink || "Unknown Cocktail";
  cocktailCategory.textContent = `Category: ${
    coctailObj.strCategory || "Unknown"
  }`;
  cocktailType.textContent = `Type: ${coctailObj.strAlcoholic || "Unknown"}`;
  cocktailGlass.textContent = `Served in: ${
    coctailObj.strGlass || "Unknown glass"
  }`;

  // INGREDIENTS & MEASURE
  const ingredientsList = clone.querySelector(".ingredients-list");
  const ingredients = [];
  for (let i = 1; i <= 15; i++) {
    const ingredient = coctailObj[`strIngredient${i}`];
    const measure = coctailObj[`strMeasure${i}`];

    if (ingredient && ingredient.trim()) {
      ingredients.push({
        ingredient: ingredient.trim(),
        measure: measure ? measure.trim() : "",
      });
    }
  }

  // CREATE LIST ITEM FOR EACH INGREDIENT
  ingredients.forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = `
                <span class="measure">${item.measure}</span>
                <span class="ingredient">${item.ingredient}</span>`;
    ingredientsList.appendChild(li);
  });

  //  INSTRUCTIONS
  const instructionsText = clone.querySelector(".instructions-text");
  if (instructionsText) {
    const instructions =
      coctailObj.strInstructions || "No instructions available.";
    instructionsText.textContent = instructions;
  }

  //  ADDITIONAL INFO
  const ibaCategory = clone.querySelector(".iba-category");
  const cocktailTags = clone.querySelector(".cocktail-tags");

  ibaCategory.textContent = coctailObj.strIBA || "Not classified";
  const tags = coctailObj.strTags || "No tags";
  cocktailTags.textContent = tags;

  //  BACK BUTTON
  const backBtn = clone.querySelector(".back-btn");
  backBtn.addEventListener("click", () => {
    renderLandingPage();
  });
  // APPEND TEMPLATE TO ROOT
  root.appendChild(clone);
}
// RENDER SEARCH PAGE (MAYBE MODAL)
function openSearchModal() {}
// SEACH FUNCTIONALITY

// SEARCH FUNCTIONALITY
function initialiseSearch() {
  const searchInput = document.querySelector("[data-search]");
  searchInput.addEventListener("input", (e) => {
    const searchResults = document.querySelector(".searchResults");
    searchResults.innerHTML = "";

    const value = e.target.value.toLowerCase();
    const filteredCocktails = coctailDB.filter((c) =>
      c.strDrink.toLowerCase().includes(value)
    );

    filteredCocktails.slice(0, 10).forEach((c) => {
      const card = createSearchResult(c);
      searchResults.appendChild(card);
    });
  });
  searchInput.addEventListener("blur", () => {
    const searchResults = document.querySelector(".searchResults");
    searchResults.innerHTML = "";
  });
}

function createSearchResult(coctailObj) {
  const cardTpl = document.getElementById("searchCardTpl");
  const clone = cardTpl.content.cloneNode(true);
  const header = clone.querySelector("[data-header]");
  header.textContent = coctailObj.strDrink;
  clone.addEventListener("click", () => renderDetailedInfo(coctailObj));

  return clone;
}

// APP INITIALISATION
async function initializeApp() {
  try {
    const cocktails = await getAllCocktails();

    cocktails.forEach((c) => coctailDB.push(c));
    renderLandingPage();

    return coctailDB;
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
}

// Start the app
initializeApp();
