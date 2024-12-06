const hamburgerMenuButton = document.querySelector('.hamburger-button');
const hamburgerMenu = document.querySelector('.hamburger-menu-outer');
const select = document.querySelector('.products-quantity-select');

let products = [];
let productsToRender = [];
let isDesktop = window.innerWidth > 900;

let pageSize = select.value;
let rowSize = getRowSize();

const standsOut = document.getElementById('desktop-nav-stands-out');
const struct = document.getElementById('desktop-nav-struct');
const productsNav = document.getElementById('desktop-nav-products');

const standsOutSection = document.getElementById('stands-out');
const structSection = document.getElementById('struct');
const productsSection = document.querySelector('.products')   

const popup = document.querySelector('.popup-outer');
const popupClose = document.querySelector('.popup-close');
const popupId = document.querySelector('.popup-id');
const popupName = document.querySelector('.popup-name');
const popupText = document.querySelector('.popup-text');

let headerHeight = document.getElementById('header').offsetHeight;

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

async function fetchData(size) {
  try {
    const res = await fetch(`https://brandstestowy.smallhost.pl/api/random?pageNumber=1&pageSize=${size}`);

    if (!res.ok) {
      console.error('Błąd przy pobieraniu danych!');
      return {};
    }

    const data = await res.json();

    console.log(data);

    return data;
  }
  catch (err) {
    console.error(err);
    return {};
  }
};

async function renderInitData(pageSize, rowSize) {
  productsToRender = [];

  products = await fetchData(pageSize);

  if (products && products.data) {
    productsToRender.push(...products.data.slice(0, rowSize));
    renderProducts(productsToRender);
  }
}

function addProducts (rowSize) {
  if (productsToRender.length >= pageSize) return;
  const productsToAdd = products.data.slice(productsToRender.length, (productsToRender.length + rowSize));
  productsToRender.push(...productsToAdd);
  renderProducts(productsToRender);
}

async function fetchNewProducts() {
  const newProducts = await fetchData(pageSize);
  if (newProducts && newProducts.data) {
    products.push(...newProducts.data); // Add the newly fetched products to the global products array
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
      if (isDesktop) {
        popup.classList.add('show-popup');
        popupId.innerText = product.id;
        popupName.innerText = `Nazwa: ${product.text.split(' ')[0]}`
        popupText.innerText = `Wartość: ${product.text.split(' ')[1]}`
      }
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
  threshold: 0.4
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

window.addEventListener('resize', () => {
  headerHeight = document.getElementById('header').offsetHeight
  rowSize = getRowSize();
  isDesktop = window.innerWidth > 900;
  }
);

select.addEventListener('change', () => {
  pageSize = select.value;

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
    addProducts(rowSize);
  }
});

popupClose.addEventListener('click', () => {
  popup.classList.remove('show-popup');
})

renderInitData(pageSize, rowSize);

