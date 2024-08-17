

// Variables
const cartOpenBtn = document.querySelector('.cart-icon');
const cartCloseBtn = document.querySelector('.fas.fa-window-close');
const clearCartBtn = document.querySelector('.clear-cart-btn');
const cartTotal = document.querySelector('.total-price');
const productDOM = document.querySelector('.products-holder');
const cartCounter = document.querySelector('.counter');
const cartContent = document.querySelector('.cart-holder');
const cartOverlay = document.querySelector('.cart-overlay');
const cartDom = document.querySelector('.cart');
const cartQuantity = document.querySelector('.quantity');
const LOCAL_STORAGE_PRODUCTS_KEY = "comfyHouse.products";
const LOCAL_STORAGE_CARTS_KEY = "comfyHouse.carts";


// Cart
let cart = [];
// Buttons
let buttonsDOM = [];


// Get The Products
class Products {

    async getProducts() {
        try {
            let result = await fetch('products.json');
            let data = await result.json();
            let products = data.items;
            products = products.map(product => {
                const { title, price } = product.fields;
                const { id } = product.sys;
                const image = product.fields.image.fields.file.url;
                return { title, price, id, image };
            })
            return products;
        } catch (error) {
            console.log(error);
        }
    }
}

// Display Products
class UI {
    displayProducts(products) {
        let result = '';
        products.forEach(product => {
            result += `
                <div class="the-product">
                    <img src=${product.image} alt="">
                    <button class="product-btn" data-id=${product.id}>
                        Add To Cart
                    </button>
                    <h3>${product.title}</h3>
                    <h4>$${product.price}</h4>
                </div>
            `;
        })

        productDOM.innerHTML = result;
    }

    setCartValues(cart) {
        let totalPrice = 0;
        let totalAmount = 0;

        cart.forEach(item => {
            totalAmount += item.amount;
            totalPrice += item.amount * item.price;
        })

        cartCounter.innerText = totalAmount;
        cartTotal.innerText = `Your Total Is: $ ${parseFloat(totalPrice.toFixed(2))}`;
        console.log(totalAmount, totalPrice);

    }

    addCartItem(item) {
        let div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `
                <img src=${item.image} alt="">
                <div class="product-info">
                    <h4>${item.title}</h4>
                    <h5>$${item.price}</h5>
                    <span class="remove-item" data-id=${item.id}>Remove</span>
                </div>
                <div class="product-quantity">
                    <i class="fas fa-chevron-up" data-id=${item.id}></i>
                    <p class="quantity">${item.amount}</p>
                    <i class="fas fa-chevron-down" data-id=${item.id}></i>
                </div>
        `;

        cartContent.appendChild(div);
    }

    showCart() {
        cartOverlay.classList.add('show-overlay');
        cartDom.classList.add('show-cart');
    }

    getBagButtons() {
        let buttons = [...document.querySelectorAll('.product-btn')];
        buttonsDOM = buttons;

        buttons.forEach(button => {
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id);

            if (inCart) {
                button.disabled = true;
                button.innerText = 'In Cart';
            }

            button.addEventListener('click', e => {
                e.target.disabled = true;
                e.target.innerText = 'In Cart';

                // Get Product
                let cartItem = { ...Store.getProduct(id), amount: 1 };
                // Save Product In Cart
                cart = [...cart, cartItem];
                // Save Cart In Local Storage
                Store.saveCart(cart);
                // Set Cart Values
                this.setCartValues(cart);
                // Display Item In Cart
                this.addCartItem(cartItem);
                // Show Cart
                this.showCart();
            })
        })
    }

    getSingleButton(id) {
        return buttonsDOM.find(button => button.dataset.id === id);
    }

    removeItem(id) {
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);
        Store.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerText = 'Add To Cart';
    }

    clearCart() {
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));

        while (cartContent.firstChild) {
            cartContent.removeChild(cartContent.firstChild);
        }
    }

    cartLogic() {
        // Clear Cart
        clearCartBtn.addEventListener('click', () => { this.clearCart() });

        // Cart Functionality
        cartContent.addEventListener('click', e => {
            if (e.target.classList.contains('remove-item')) {
                let removeItem = e.target;
                let id = e.target.dataset.id;
                this.removeItem(id);
                removeItem.parentElement.parentElement.remove();
            } else if (e.target.classList.contains('fa-chevron-up')) {
                let addAmount = e.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount += 1;
                Store.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText = tempItem.amount;
            } else if (e.target.classList.contains('fa-chevron-down')) {
                let lowerAmount = e.target;
                let id = lowerAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount -= 1;

                if (tempItem.amount === 0) {
                    this.removeItem(id);
                    lowerAmount.parentElement.parentElement.remove();
                }

                Store.saveCart(cart);
                this.setCartValues(cart);
                lowerAmount.previousElementSibling.innerText = tempItem.amount;
            }
        })
    }

    populateCart(cart) {
        cart.forEach(item => this.addCartItem(item));
    }

    hideCart() {
        cartOverlay.classList.remove('show-overlay');
        cartDom.classList.remove('show-cart');
    }

    setupApp() {
        cart = Store.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartOpenBtn.addEventListener('click', this.showCart);
        cartCloseBtn.addEventListener('click', this.hideCart);
    }
}

// Save In Local Storage
class Store {

    static saveProducts(products) {
        window.localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(products));
    }

    static getProduct(id) {
        let products = JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_PRODUCTS_KEY));
        return products.find(product => product.id === id);
    }

    static saveCart(cart) {
        window.localStorage.setItem(LOCAL_STORAGE_CARTS_KEY, JSON.stringify(cart));
    }

    static getCart() {
        return JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_CARTS_KEY)) || [];
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const ui = new UI();
    const products = new Products();

    // Setup App
    ui.setupApp();

    // Getting Products
    products.getProducts().then(products => {
        ui.displayProducts(products);
        Store.saveProducts(products);
    }).then(() => {
        ui.getBagButtons();
        ui.cartLogic();
    })
})
