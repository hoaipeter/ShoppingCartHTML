const currency = "$";
const txtTotalOrder = document.getElementById("txtTotalOrder");
let products = [];
const pageEvent = {
    init: function () {
        //nav toggle mobile
        let navToggle = document.querySelector(".nav__toggle");
        let navWrapper = document.querySelector(".nav__wrapper");
        navToggle.addEventListener("click", function () {
            if (navWrapper.classList.contains("active")) {
                this.setAttribute("aria-expanded", "false");
                this.setAttribute("aria-label", "menu");
                navWrapper.classList.remove("active");
            } else {
                navWrapper.classList.add("active");
                this.setAttribute("aria-label", "close menu");
                this.setAttribute("aria-expanded", "true");
            }
        });
    }
};
const cart = {
    init: function () {
        cart.storage();
        cart.getListCart();
    },
    storage: function () {
        if (sessionStorage['products']) {
            products = JSON.parse(sessionStorage.getItem("products"));
        }
        window.sessionStorage.setItem("products", JSON.stringify(products));
    },
    registerEvent: function () {
        // open sidebar cart
        const elmOpenCart = document.getElementById("btnOpenCart");
        elmOpenCart.addEventListener('click', function () {
            openSidebar();
        })
        // close sidebar cart
        const elmCloseCart = document.getElementById("btnCloseCart");
        elmCloseCart.addEventListener('click', function () {
            closeSidebar();
        })

        // input quantity
        const elmInputQuantities = document.getElementsByClassName("txt-input-quantity");
        Array.from(elmInputQuantities).forEach(function (elmInputQuantity) {
            elmInputQuantity.addEventListener('keyup', function () {
                cart.calculatePrice(this);
            });
            elmInputQuantity.addEventListener('keypress', function (e) {
                const regex = new RegExp("^[0-9]+$");
                const key = String.fromCharCode(!e.charCode ? e.which : e.charCode);
                if (this.value === "" && key === "0") {
                    e.preventDefault();
                    return false;
                }
                if (!regex.test(key)) {
                    e.preventDefault();
                    return false;
                }
            });
        });

        // click decrease quantity
        const elmBtnDecreases = document.getElementsByClassName("btn-decrease");
        Array.from(elmBtnDecreases).forEach(function (elmBtnDecrease) {
            elmBtnDecrease.addEventListener('click', function () {
                let elmInputQuantity = this.nextElementSibling;
                let quantity = parseInt(elmInputQuantity.value);
                if (quantity === 1) {
                    return false;
                }
                elmInputQuantity.value = quantity - 1;
                cart.calculatePrice(elmInputQuantity);
            });
        });

        // click increase quantity
        const elmBtnIncreases = document.getElementsByClassName("btn-increase");
        Array.from(elmBtnIncreases).forEach(function (elmBtnIncrease) {
            elmBtnIncrease.addEventListener('click', function () {
                let elmInputQuantity = this.previousElementSibling;
                let quantity = parseInt(elmInputQuantity.value);
                elmInputQuantity.value = quantity + 1;
                cart.calculatePrice(elmInputQuantity);
            });
        });

        // click remove product
        const elmBtnRemoves = document.getElementsByClassName("btn-cart-remove");
        Array.from(elmBtnRemoves).forEach(function (elmBtnRemove) {
            elmBtnRemove.addEventListener('click', function () {
                let productId = this.closest("li").getAttribute('data-id');
                let storedProduct = products.findIndex(elem => elem.productId === productId);
                if (storedProduct !== -1) {
                    products.splice(storedProduct, 1);
                }
                window.sessionStorage.setItem("products", JSON.stringify(products));
                this.closest("li").remove();

                if (products.length === 0) {
                    closeSidebar();
                }

                cart.countCartTotal(products.length);
                cart.getTotalPrice();
            })
        })
    },
    calculatePrice: function (elmInput) {
        let quantity = parseInt(elmInput.value);
        let price = parseFloat(elmInput.getAttribute('data-price'));
        if (isNaN(quantity)) {
            quantity = "1";
        }

        let amount = (quantity * price);

        let elmProduct = elmInput.closest('li');

        let labelProductPrice = elmProduct.querySelector(".cart-product__price > span");
        labelProductPrice.innerHTML = quantity + " x " + currency + price;

        let productPriceTotal = elmProduct.querySelector(".cart-product__price--total");
        productPriceTotal.innerHTML = currency + cart.formarCurrency(amount);

        let product = {
            productId: elmProduct.getAttribute('data-id'),
            productImage: elmProduct.querySelector(".cart-product__image > img").getAttribute('src'),
            productName: elmProduct.querySelector(".cart-product__name").innerHTML,
            productPrice: parseFloat(elmInput.getAttribute('data-price')),
            productQuantity: parseInt(elmInput.value)
        }
        let storedProduct = products.findIndex(elem => elem.productId === product.productId);
        if (storedProduct !== -1) {
            products[storedProduct].productQuantity = product.productQuantity;
            window.sessionStorage.setItem("products", JSON.stringify(products));
        }

        cart.getTotalPrice();
    },
    getTotalPrice: function () {
        let elmProductPriceTotals = document.getElementsByClassName("cart-product__price--total");
        let total = 0;
        Array.from(elmProductPriceTotals).forEach(function (elm) {
            let price = parseFloat(elm.textContent.replace(currency, '').replace(',', ''));
            total += price;
        })

        txtTotalOrder.innerHTML = currency + cart.formarCurrency(total);
    },
    addToCart: function (elm) {
        let elmProduct = elm.closest('div.product');
        let product = {
            productId: elmProduct.getAttribute('data-id'),
            productImage: elmProduct.querySelector("img").getAttribute('src'),
            productName: elmProduct.querySelector(".product-name").innerHTML,
            productPrice: parseFloat(elmProduct.querySelector("div.product-price > span")
              .innerHTML
              .replace(currency, '')
              .replace(',', '')),
            productQuantity: 1
        }
        let storedProduct = products.findIndex(elem => elem.productId === product.productId);
        if (storedProduct === -1) {
            products.push(product);
        } else {
            products[storedProduct].productQuantity += 1;
        }

        window.sessionStorage.setItem("products", JSON.stringify(products));
        cart.getListCart();
        openSidebar();
    },
    getListCart: function () {
        let template = '';
        Array.from(products).forEach(function (product) {
            template += cart.renderCartProductItem(product);
        })
        document.getElementsByClassName('cart-products')[0].innerHTML = template;

        cart.countCartTotal(products.length);
        cart.getTotalPrice();
        cart.registerEvent();
    },
    renderCartProductItem: function (data) {
        let amount = parseInt(data.productQuantity) * parseFloat(data.productPrice);
        return `<li data-id="` + data.productId + `">
                            <div class="cart-product-item">
                                <div class="cart-product__image">
                                    <img src="` + data.productImage + `" alt="product-image"/>
                                </div>
                                <div class="cart-product__info">
                                    <div class="cart-product__name">
                                        <a href="#">` + data.productName + `</a>
                                    </div>
                                    <div class="cart-product__quantity">
                                        <button class="btn-quantity btn-decrease">
                                            <ion-icon name="remove-outline"></ion-icon>
                                        </button>
                                        <input type="text" class="txt-input-quantity" value="` + data.productQuantity +
          `" data-price="` + data.productPrice + `">
                                        <button class="btn-quantity btn-increase">
                                            <ion-icon name="add-outline"></ion-icon>
                                        </button>
                                    </div>
                                    <div class="cart-product__price">
                                        <span>` + data.productQuantity + ` x $` + data.productPrice + `</span>
                                    </div>
                                </div>
                                <div class="cart-product__action">
                                    <a href="javascript:void(0)" class="btn btn-cart-remove" title="remove">X</a>
                                    <span class="cart-product__price--total">$` + cart.formarCurrency(amount) + `</span>
                                </div>
                            </div>
                        </li>`;
    },
    countCartTotal: function (total) {
        document.getElementsByClassName("cart-badge")[0].innerHTML = total;
    },
    formarCurrency: function (number) {
        return number.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    }
};
pageEvent.init();
cart.init();

const openSidebar = () => {
    let w = "350px";
    if (screen.width > 280 && screen.width <= 320) {
        w = "290px";
    } else if (screen.width <= 280) {
        w = "270px";
    }
    document.getElementById("sidebarCart").style.width = w;
    document.getElementsByTagName("BODY")[0].style.overflow = "hidden";
};

const closeSidebar = () => {
    document.getElementById("sidebarCart").style.width = "0px";
    document.getElementsByTagName("BODY")[0].style.overflow = "auto";
};

document.onclick = function (e) {
    if (e.target.id !== 'sidebarCart' &&
        e.target.id !== 'btnOpenCart' &&
        e.target.className !== 'btn btn-outline-primary btn-add-cart' &&
        e.target.className !== 'btn btn-cart-remove' &&
        e.target.className !== 'cart-badge' &&
        e.target.className !== 'icon-cart md hydrated') {
        if (e.target.offsetParent === null) {
            closeSidebar()
        }
        if (e.target.offsetParent &&
            e.target.offsetParent.id !== 'sidebarCart') {
            closeSidebar()
        }
    }
}



