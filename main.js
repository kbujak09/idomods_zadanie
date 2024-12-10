const hamburgerMenuButton = document.querySelector('.hamburger-button');
const hamburgerMenu = document.querySelector('.hamburger-menu-outer');
const hamburgerMenuInner = document.querySelector('.hamburger-menu');
const select = document.querySelector('.products-quantity-select');

let products = [];
let productsToRender = [];
let isDesktop = window.innerWidth > 900;

let pageSize = select.value;
let rowSize = getRowSize();
let pageCount = 1;

const standsOut = document.getElementById('desktop-nav-stands-out');
const struct = document.getElementById('desktop-nav-struct');
const productsNav = document.getElementById('desktop-nav-products');

const standsOutSection = document.getElementById('stands-out');
const structSection = document.getElementById('struct');
const productsSection = document.querySelector('.products')   

const popupOuter = document.querySelector('.popup-outer');
const popupInner = document.querySelector('.popup-inner');
const popupClose = document.querySelector('.popup-close');
const popupId = document.querySelector('.popup-id');
const popupName = document.querySelector('.popup-name');
const popupText = document.querySelector('.popup-text');

let headerHeight = document.getElementById('header').offsetHeight;
let isFetchingData = false;

function toggleMenu() {
  if (hamburgerMenu.style.display === 'block') {
    hamburgerMenu.style.display = 'none'
    document.body.style.overflow = 'auto'
  } else {
    hamburgerMenu.style.display = 'block'
    document.body.style.overflow = 'hidden'
    window.scrollTo(0,0);
  }
};

async function fetchData(size, page) {
  isFetchingData = true;
  try {
    const res = await fetch(`https://brandstestowy.smallhost.pl/api/random?pageNumber=${page}&pageSize=${size}`);

    if (!res.ok) {
      console.error('Błąd przy pobieraniu danych!');
      return {};
    }

    const data = await res.json();

    return data;
  }
  catch (err) {
    console.error(err);
    return {};
  }
  finally {
    isFetchingData = false;
  }
};

async function renderInitData(pageSize, rowSize) {
  productsToRender = [];

  products = await fetchData(pageSize, pageCount++);

  if (products && products.data) {
    productsToRender.push(...products.data.slice(0, rowSize));
    renderProducts(productsToRender);
  }
}

function addProducts (rowSize) {
  if (!products.data) return;
  if (productsToRender.length >= products.data.length && !isFetchingData) {
    fetchNewProducts();
  };
  const productsToAdd = products.data.slice(productsToRender.length, (productsToRender.length + rowSize));
  productsToRender.push(...productsToAdd);
  renderProducts(productsToRender);
}

async function fetchNewProducts() {
  const newProducts = await fetchData(pageSize, pageCount++);
  if (newProducts && newProducts.data) {
    products.data.push(...newProducts.data);
  }
}

function renderProducts() {
  const productList = document.querySelector('.products-list');
  productList.replaceChildren();
  productsToRender.forEach(product => {
    const productContainer = document.createElement('li');
    const productData = document.createElement('div');
    
    productContainer.classList.add('product-container');
    productData.classList.add('product-data');
    
    productData.innerText = `ID: ${product.id}`;
    
    productContainer.appendChild(productData);
    productList.appendChild(productContainer);

    productContainer.addEventListener('click', () => {
    popupOuter.classList.add('show-popup');
    popupId.innerText = product.id;
    popupName.innerText = `Nazwa: ${product.text.split(' ')[0]}`;
    popupText.innerText = `Wartość: ${product.text.split(' ')[1]}`;
    });
  });
};

function isNearBottom() {
  return window.innerHeight + window.scrollY >= document.body.offsetHeight - 100;
};

function getRowSize() {
  const list = document.querySelector('.products-list');
  return window.getComputedStyle(list).getPropertyValue('grid-template-columns').split(' ').length;
}

function scrollToSection(section) {
  const targetPosition = section.offsetTop - headerHeight;
  window.scrollTo({
    top: targetPosition,
    behavior: 'smooth'
  });
}

const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.target === standsOutSection) {
      if (entry.isIntersecting) {
        standsOut.classList.add('active');
      } else {
        standsOut.classList.remove('active');
      }
    } else if (entry.target === structSection) {
      if (entry.isIntersecting) {
        struct.classList.add('active');
      } else {
        struct.classList.remove('active');
      }
    } else if (entry.target === productsSection) {
      if (entry.isIntersecting) {
        productsNav.classList.add('active');
      } else {
        productsNav.classList.remove('active');
      }
    }
  });
}, {
  threshold: window.innerWidth > 1920 ? 0.32 : 0.4
});

observer.observe(standsOutSection);
observer.observe(structSection);
observer.observe(productsSection);

standsOut.addEventListener('click', () => {
  scrollToSection(standsOutSection);
});

struct.addEventListener('click', () => {
  scrollToSection(structSection);
});

productsNav.addEventListener('click', () => {
  scrollToSection(productsSection);
});

hamburgerMenuButton.addEventListener('click', toggleMenu);
hamburgerMenu.addEventListener('click', toggleMenu);
hamburgerMenuInner.addEventListener('click', (e) => e.stopPropagation());

window.addEventListener('resize', () => {
  headerHeight = document.getElementById('header').offsetHeight
  rowSize = getRowSize();
  isDesktop = window.innerWidth > 900;
  }
);

select.addEventListener('change', () => {
  pageSize = select.value;
  pageCount = 2;

  if (pageSize < productsToRender.length) {
    productsToRender = productsToRender.slice(0, pageSize);
    renderProducts();
  }

  fetchData(pageSize)
  .then(data => {
    products = data;
    if (isNearBottom()) {
      addProducts(rowSize);
    }
  })
    .catch(error => console.error('Error fetching data:', error));

  }); 

window.addEventListener('scroll', () => {
  if (isNearBottom()) {
    if (!products.data && !isFetchingData) {
      renderInitData(pageSize, rowSize);
    } else {
      addProducts(rowSize);
    }
  }
});

popupClose.addEventListener('click', () => {
  popupOuter.classList.remove('show-popup');
});

popupOuter.addEventListener('click', () => {
  popupOuter.classList.remove('show-popup');
});

popupInner.addEventListener('click', (e) => {
  e.stopPropagation();
});

