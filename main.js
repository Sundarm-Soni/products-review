const productsContainer = document.querySelector(".products-container");
const flipkartImage = document.querySelector(".flipkart-image");
const spinnerContainer = document.querySelector(".spinner-container");
const productsErrorContainer = document.querySelector(
  ".products-error-container"
);
const productCard = document.querySelector(".product-card");
const retryButton = document.querySelector(".retry-btn");
const productsList = document.querySelector(".products-list");
const productReviewContainer = document.querySelector(
  ".products-review-container"
);
const productStarRating = document.querySelector(".product-star-rating");
const allStars = document.querySelectorAll(".star-rating");
const productItems = document.querySelectorAll(".product-card");
const nextBtn = document.querySelector(".btn-next");
const prevBtn = document.querySelector(".btn-prev");
const iconsWrapper = document.querySelectorAll(".icon-wrapper");
const progress = document.querySelector(".progress");
const productTextArea = document.querySelector(".product-textarea");
const productReviewInput = document.querySelector(".product-review-input");
const reviewCharacterCount = document.querySelector(".review-characters");
let currentTotalSelectedStars = -1;
const API_URL = "https://65e60da8d7f0758a76e8083a.mockapi.io/api/products";

let currentSelectedStep = 1;

// Product class to fetch products
class Product {
  async getProducts() {
    spinnerContainer.classList.add("show-spinner");
    try {
      const response = await fetch(API_URL, {
        method: "GET",
      });
      productsErrorContainer.classList.remove("show-error-container");
      const result = await response.json();
      return result;
    } catch (err) {
      if (err.status === "404") {
        productsErrorContainer.classList.add("show-error-container");
        spinnerContainer.classList.remove("show-spinner");
      }
    }
  }
}

// UI class to show UI
class UIDisplay {
  showProducts(products) {
    const createProductList = products.length
      ? products.map((product, index) => {
          return `
      <div class="product-card" data-index=${index}>
      <div class="product-card-image">
        <img src="${this.setImageWidthHeight(product.image)}" alt="${
            product.title
          }" loading="lazy" />
      </div>
      <div class="product-details-container">
      <div class="product-details-info">
        <h2>${product.title}</h2>
        <p>
        ${product.subTitle[0]}
        </p>
      </div>
      <div class="product-rating-price">
        <div class="product-rating">${product.rating}</div>
        <p class="product-price">${this.covertToIndianRupee(product.price)}</p>
      </div>
      </div>
    </div>
      `;
        })
      : [];

    productsList.innerHTML = createProductList.join("") || "";
  }

  static showReviewScreen() {
    return;
  }

  covertToIndianRupee(price) {
    return price.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }

  setImageWidthHeight(imageUrl) {
    return imageUrl
      .replace("{@width}", "400")
      .replace("{@height}", "400")
      .replace("{@quality}", "90");
  }

  showStarRating() {
    for (let i = 0; i < 5; i++) {
      let star = document.createElement("img");
      star.src = "./assets/star.svg";
      star.alt = "star";
      star.classList.add("star-rating");
      productStarRating.appendChild(star);
    }
  }
}

// helper class for storage
class Storage {
  static setProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }

  static getProducts() {
    return JSON.parse(localStorage.getItem("products"));
  }

  static setProduct(product) {
    localStorage.setItem("product", JSON.stringify(product));
  }

  static getProduct() {
    return JSON.parse(localStorage.getItem(`product`));
  }
}

//Utility function to check data in local storage
const checkDataInLocalStorageUtilityFunction = () => {
  const ui = new UIDisplay();
  const products = new Product();
  if (Storage.getProducts() !== null) {
    ui.showProducts(Storage.getProducts());
    ui.showStarRating();
  } else {
    products
      .getProducts()
      .then((products) => {
        if (products && products.length) {
          spinnerContainer.classList.remove("show-spinner");
          ui.showProducts(products);
          ui.showStarRating();
          Storage.setProducts(products);
        }
      })
      .catch((err) => {
        if (err) {
          productsErrorContainer.classList.add("show-error-container");
          productsContainer.classList.add("hide-products-container");
          spinnerContainer.classList.remove("show-spinner");
        }
      });
  }
};

const showProductsList = () => {
  //show product list
  productsList.addEventListener("click", (event) => {
    event.stopPropagation();

    productItems.forEach((product) => {
      product.classList.remove("selected");
    });

    if (event.target.classList.contains("product-card")) {
      event.target.classList.add("selected");
      const index = event.target.dataset.index;
      const product = Storage.getProducts("products")[index];
      Storage.setProduct(product);
      productReviewContainer.classList.add("show-product-review-container");
      productsContainer.classList.add("split-container");
    }
  });
};
const rateProduct = () => {
  const stars = Array.from(productStarRating.children);

  const handleStarMouseOver = (event) => {
    event.stopPropagation();
    const currentRatingValue = event.target.dataset.rating;
    if (!currentRatingValue) return;
    else handleUpdateRatingState(currentRatingValue);
  };

  const handleStarOnClick = (event) => {
    event.stopPropagation();
    const currentRatingValue = event.target.dataset.rating;
    currentTotalSelectedStars = currentRatingValue;
    handleUpdateRatingState(currentTotalSelectedStars);
    addRatingToSelectedProduct();
  };

  const addRatingToSelectedProduct = () => {
    const currentProduct = Storage.getProduct("product");
    const updatedProducts = Storage.getProducts().map((product) => {
      if (product.title.includes(currentProduct.title)) {
        const updateProduct = {
          ...currentProduct,
          userRating: currentTotalSelectedStars,
        };
        Storage.setProduct(updateProduct);
        return updateProduct;
      } else {
        return product;
      }
    });
    Storage.setProducts(updatedProducts);
  };

  const handleMouseLeave = () => {
    handleUpdateRatingState(currentTotalSelectedStars);
  };

  function handleUpdateRatingState(getCurrentRatingValue) {
    for (let i = 0; i < 5; i++) {
      if (i < getCurrentRatingValue) {
        stars[i].classList.add("star-selected");
      } else {
        stars[i].classList.remove("star-selected");
      }
    }
  }

  stars.forEach((starItem, index) => {
    starItem.setAttribute("data-rating", index + 1);
    starItem.addEventListener("mouseover", handleStarMouseOver);
    starItem.addEventListener("click", handleStarOnClick);
    starItem.addEventListener("mouseLeave", handleMouseLeave);
  });
};

const handleStepper = () => {
  nextBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    if (currentSelectedStep < iconsWrapper.length) {
      if (currentTotalSelectedStars < 1 && currentSelectedStep === 1) {
        productReviewInput.classList.remove("show-review-screen");
        alert("Please select stars to proceed");
        return;
      }
      currentSelectedStep++;
      if (currentSelectedStep === 2) {
        productReviewInput.classList.add("show-review-screen");
        productStarRating.classList.add("hide-star-rating");
      }
      if (productTextArea.value.length) {
        alert("Please enter review");
        return;
      }
      if (currentSelectedStep === 3) {
        productReviewInput.classList.remove("show-review-screen");
        productStarRating.classList.remove("hide-star-rating");
      }

      if (
        productReviewInput.classList.contains("show-review-screen") &&
        productTextArea.value === ""
      ) {
        return;
      }
    }
    handleUpdateStep();
  });

  prevBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    if (currentSelectedStep > 1) {
      currentSelectedStep--;
    }

    handleUpdateStep();
  });

  const addReviewToSelectedProduct = (review) => {
    const currentProduct = Storage.getProduct("product");
    const updatedProducts = Storage.getProducts().map((product) => {
      if (product.title.includes(currentProduct.title)) {
        const updateProduct = {
          ...currentProduct,
          userReview: review,
        };
        Storage.setProduct(updateProduct);
        return updateProduct;
      } else {
        return product;
      }
    });
    Storage.setProducts(updatedProducts);
  };
  productTextArea.addEventListener("keyup", (event) => {
    const characters = event.target.value.length;
    reviewCharacterCount.textContent = "";
    if (characters > 100) {
      return;
    }
    reviewCharacterCount.textContent = `${characters}/100`;
    addReviewToSelectedProduct(event.target.value);
  });
};

const handleUpdateStep = () => {
  iconsWrapper.forEach((item, index) => {
    if (index < currentSelectedStep) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  progress.style.width =
    ((currentSelectedStep - 1) / (iconsWrapper.length - 1)) * 100 + "%";

  if (currentSelectedStep === 1) {
    nextBtn.textContent = "Next";
    return;
  }
  if (currentSelectedStep === iconsWrapper.length) {
    nextBtn.textContent = "Submit";
    return;
  }
};

window.addEventListener("DOMContentLoaded", () => {
  checkDataInLocalStorageUtilityFunction();

  //Retry if api fails
  retryButton.addEventListener("click", () => {
    checkDataInLocalStorageUtilityFunction();
  });

  showProductsList();

  rateProduct();

  handleStepper();
});
