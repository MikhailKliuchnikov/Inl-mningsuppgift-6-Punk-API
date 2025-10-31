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
    
    const nameEl = document.querySelector(".coctailName");
      const titleEl = randomCoctailWrapper.querySelector("h5");
        nameEl.textContent = titleEl.textContent;
  };
  
  randomCoctaiLBtn.addEventListener("click", (e) => {
    displayRandomCoctail();
  });
  
  root.innerHTML = "";
  root.appendChild(clone);
  
  displayRandomCoctail();
  
  // Wire up search button in header
  const searchModalBtn = document.getElementById("searchModal");
  if (searchModalBtn) {
    searchModalBtn.addEventListener("click", () => {
      renderSearchPage();
    });
  }
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
    }.`;
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

// ===== SEARCH PAGE FUNCTIONALITY =====

// RENDER SEARCH PAGE
function renderSearchPage() {
  const root = document.getElementById("root");
  root.innerHTML = "";

  const template = document.getElementById("searchPageTpl");
  const clone = template.content.cloneNode(true);

  // Get elements from the template
  const backBtn = clone.querySelector(".back-to-main-btn");
  const searchInput = clone.querySelector(".search-page-input");
  const resultGrid = clone.querySelector(".resultGrid");
  const paginationWrapper = clone.querySelector(".pagination-controls-wrapper");
  const searchInfo = clone.querySelector(".search-info");

  // Back button functionality
  backBtn.addEventListener("click", () => {
    renderLandingPage();
  });

  // Append to DOM first
  root.appendChild(clone);

  // Now get references from actual DOM
  const searchInputDOM = document.querySelector(".search-page-input");
  const resultGridDOM = document.querySelector(".resultGrid");
  const paginationWrapperDOM = document.querySelector(".pagination-controls-wrapper");
  const searchInfoDOM = document.querySelector(".search-info");

  // Search functionality
  searchInputDOM.addEventListener("input", (e) => {
    const value = e.target.value.toLowerCase().trim();
    
    if (value === "") {
      searchState.results = [];
      searchState.page = 1;
      resultGridDOM.innerHTML = "";
      paginationWrapperDOM.innerHTML = "";
      searchInfoDOM.innerHTML = "";
      return;
    }

    searchState.results = coctailDB.filter((c) => {
      const matchesDrink = c.strDrink.toLowerCase().includes(value);
      const matchesCategory = c.strCategory && c.strCategory.toLowerCase().includes(value);
      const matchesIngredients = [
        c.strIngredient1, c.strIngredient2, c.strIngredient3,
        c.strIngredient4, c.strIngredient5, c.strIngredient6,
        c.strIngredient7, c.strIngredient8, c.strIngredient9,
        c.strIngredient10, c.strIngredient11, c.strIngredient12,
        c.strIngredient13, c.strIngredient14, c.strIngredient15
      ].some(ingredient => ingredient && ingredient.toLowerCase().includes(value));
      
      return matchesDrink || matchesCategory || matchesIngredients;
    });
    
    searchState.page = 1;
    renderSearchPageResults();
  });

  // Function to render results with pagination
  function renderSearchPageResults() {
    resultGridDOM.innerHTML = "";
    paginationWrapperDOM.innerHTML = "";
    searchInfoDOM.innerHTML = "";

    const { results, page, pageSize } = searchState;
    
    if (results.length === 0) {
      searchInfoDOM.innerHTML = "<p>No cocktails found. Try a different search term.</p>";
      return;
    }

    // Calculate pagination
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const pageResults = results.slice(start, end);
    const totalPages = Math.ceil(results.length / pageSize);

    // Display search info
    searchInfoDOM.innerHTML = `<p>Found ${results.length} cocktail${results.length !== 1 ? 's' : ''}</p>`;

    // Render cocktail preview cards
    pageResults.forEach((cocktail) => {
      const card = createCoctailCard(cocktail);
      resultGridDOM.appendChild(card);
    });

    // Add pagination controls if needed
    if (totalPages > 1) {
      const paginationDiv = document.createElement("div");
      paginationDiv.className = "pagination-controls";

      // Previous button
      const prevBtn = document.createElement("button");
      prevBtn.textContent = "← Previous";
      prevBtn.className = "pagination-btn";
      prevBtn.disabled = page === 1;
      prevBtn.addEventListener("click", () => {
        if (page > 1) {
          searchState.page--;
          renderSearchPageResults();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });

      // Page info
      const pageInfo = document.createElement("span");
      pageInfo.className = "page-info";
      pageInfo.textContent = `Page ${page} of ${totalPages}`;

      // Next button
      const nextBtn = document.createElement("button");
      nextBtn.textContent = "Next →";
      nextBtn.className = "pagination-btn";
      nextBtn.disabled = page === totalPages;
      nextBtn.addEventListener("click", () => {
        if (page < totalPages) {
          searchState.page++;
          renderSearchPageResults();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });

      paginationDiv.appendChild(prevBtn);
      paginationDiv.appendChild(pageInfo);
      paginationDiv.appendChild(nextBtn);
      paginationWrapperDOM.appendChild(paginationDiv);
    }
  }
}

// SEARCH FUNCTIONALITY && PAGINATION (Old dropdown search - can be removed or kept)
// PAGINATION VARIABLE
let searchState = { results: [], page: 1, pageSize: 12 };
// CHECK IF NAME, CATEGORY OR INGREDIENTS ARE MATCHING
function initialiseSearch() {

  const searchInput = document.querySelector("[data-search]");
  const searchResults = document.querySelector(".searchResults");
  
  searchInput.addEventListener("input", (e) => {
    const value = e.target.value.toLowerCase();
    searchState.results = coctailDB.filter((c) => {
      // RETURN MATCHING NAME
      const matchesDrink = c.strDrink.toLowerCase().includes(value);
      // RETURN MATCHING CATEGORY
      const matchesCategory = c.strCategory && c.strCategory.toLowerCase().includes(value);
      // RETURN ANY OF MATCHING INGREDIENTS
      const matchesIngredients = [
        c.strIngredient1, c.strIngredient2, c.strIngredient3,
        c.strIngredient4, c.strIngredient5, c.strIngredient6,
        c.strIngredient7, c.strIngredient8, c.strIngredient9,
        c.strIngredient10, c.strIngredient11, c.strIngredient12,
        c.strIngredient13, c.strIngredient14, c.strIngredient15
      ].some(ingredient => ingredient && ingredient.toLowerCase().includes(value));
      
      return matchesDrink || matchesCategory || matchesIngredients;
    });
    searchState.page = 1; 
    renderSearchResults();
  });
  
  // Clear results when user focuses away from search input
  searchInput.addEventListener("blur", () => {
    // Delay to allow click events to fire first && delay feels good UX 
    setTimeout(() => {
      searchResults.innerHTML = "";
      searchState = { results: [], page: 1, pageSize: 10 };
    }, 200);
  });
}
// SORT AND RENDER THE MATCHING RESULTS; RENDER PAGINATION IF EXISTS
function renderSearchResults() {
  const searchResults = document.querySelector(".searchResults");
  searchResults.innerHTML = "";

  const { results, page, pageSize } = searchState;
  
  if (results.length === 0) return;

  // CALCULATE PAGINATION
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pageResults = results.slice(start, end);
  const totalPages = Math.ceil(results.length / pageSize);

  // RENDER 10 RESULTS
  pageResults.forEach((c) => {
    const card = createSearchResult(c);
    searchResults.appendChild(card);
  });
  

  // PAGINATION BUTTONS
  if (results.length > pageSize) {
    const paginationDiv = document.createElement("div");
    paginationDiv.className = "pagination-controls";
    paginationDiv.style.cssText = "display: flex; gap: 10px; align-items: center; padding: 10px; justify-content: center;";
    // PREVIOUS BUTTON
    const prevBtn = document.createElement("button");
    prevBtn.textContent = "Previous";
    prevBtn.disabled = page === 1;
    prevBtn.style.cssText = page === 1 ? "opacity: 0.5; cursor: not-allowed;" : "cursor: pointer;";
    prevBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (page > 1) {
        searchState.page--;
        renderSearchResults();
      }
    });

    const pageInfo = document.createElement("span");
    pageInfo.textContent = `Page ${page} of ${totalPages} (${results.length} results)`;
    pageInfo.style.cssText = "font-size: 14px;";
    // NEXT BUTTON
    const nextBtn = document.createElement("button");
    nextBtn.textContent = "Next";
    nextBtn.disabled = page === totalPages;
    nextBtn.style.cssText = page === totalPages ? "opacity: 0.5; cursor: not-allowed;" : "cursor: pointer;";
    nextBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (page < totalPages) {
        searchState.page++;
        renderSearchResults();
      }
    });

    paginationDiv.appendChild(prevBtn);
    paginationDiv.appendChild(pageInfo);
    paginationDiv.appendChild(nextBtn);
    searchResults.appendChild(paginationDiv);
  }
}
// CREATE A RESULT CARD ELEMENT
function createSearchResult(coctailObj) {
  const cardTpl = document.getElementById("coctailPreviewTpl");
  const clone = cardTpl.content.cloneNode(true);
  const nameElement = clone.querySelector("coctail-preview-title");
  const imgElement = clone.querySelector(".cocktail-preview-image");
  nameElement.addEventListener("click", () => renderDetailedInfo(coctailObj));
  return clone;
}

// APP INITIALISATION
async function initializeApp() {
  try {
    const cocktails = await getAllCocktails();

    cocktails.forEach((c) => coctailDB.push(c));
    renderLandingPage();
    
    // Wire up the search button in header
    const searchModalBtn = document.getElementById("searchModal");
    if (searchModalBtn) {
      searchModalBtn.addEventListener("click", () => {
        renderSearchPage();
      });
    }

    return coctailDB;
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
}

// Start the app
initializeApp();
