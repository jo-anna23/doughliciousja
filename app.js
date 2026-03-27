/* Jo-Anna Martinez ID:2305804*/
// Cart storage - localStorage 
//function to read the cart array from local storage and returns empty if nothing is stored
function loadCart(){
    const stored = localStorage.getItem('doughliciousCart');
    return stored ? JSON.parse(stored) : [];
}
//function to save cart array to localStorage
function saveCart(cartArray){
    localStorage.setItem('doughliciousCart', JSON.stringify(cartArray));
}
//function for user accounts 
//function to read all registered users from localStorage.
function loadUsers(){
    const stored = localStorage.getItem('doughliciousUsers');
    return stored ? JSON.parse(stored) :[];
}
// function to save users to localStorage
function saveUsers(usersArray){
    localStorage.setItem('doughliciousUsers', JSON.stringify(usersArray));
}
//function to search for matching emails 
function findUserByEmail(email){
    const users = loadUsers();
    return users.find(function(u) {
        return u.email.toLowerCase() === email.toLowerCase();
    }) || null;
}
//function to update the cart item count badge in the navigation bar
function updateCartBadge(){
    const cart = loadCart();
    const totalQty = cart.reduce(function(sum,item) { 
        return sum + item.quantity;
    }, 0);
    document.querySelectorAll('#cartCount').forEach(function(badge) {
        badge.textContent=totalQty;
    });
}
//function to add products to cart & increment if it already exists
function addToCart(name, price){
    const cart = loadCart();
    const existing = cart.find(function(item){ return item.name === name;});
    if(existing){
        existing.quantity++;
    }else{
        cart.push({name: name, price: price, quantity: 1,icon: getProductIcon(name) });
    }
    saveCart(cart);
    updateCartBadge();
    showCartNotification(name);
    if(document.getElementById('cartItemsContainer')){
        renderCart();
    }
}
//function to return matching emji for a product name.
function getProductIcon(name){
    const map={
        'Strawberry Dream Cake': '&#127874;',
        'Chocolate Fudge Cake': '&#127874;',
        'Vanilla Bean Cake': '&#127874;',
        'Carrot Cake': '&#127874;',
        'Strawberry Cheesecake': '&#127874;',
        'Lemon Blueberry Cheesecake': '&#127874;',
        'Red Velvet Cupcakes': '&#129473;',
        'Lemon Sage Cupcakes': '&#129473;',
        'Coconut Pastry Box': '&#129381;',
        'Brown Butter Cookies': '&#127850;',
        'Jamaican Spice Bun': '&#x1F1EF;&#x1F1F2;',
        'Coconut Drops': '&#129381;',
        };
        return map[name] || '&#127856;';
}
//function showing a temporary notification when an item is added to the cart
function showCartNotification(name) {
  // Remove existing toast if present
    const existing = document.getElementById('cartToast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'cartToast';
    toast.style.cssText = 
        'position: fixed; bottom: 2rem; right: 2rem;'+
        'background: var(--sage-dark); color: white;' +
        'padding: 0.9rem 1.5rem; border-radius: 50px;'+
        'font-family: var(--font-body); font-weight: 600;'+
        'font-size: 0.9rem; z-index: 9999;'+
        'box-shadow: 0 8px 25px rgba(0,0,0,0.2);'+
        'animation: slideInToast 0.3s ease;';
    
    toast.textContent = '\u2705 ' + name + ' added to cart!';
    document.body.appendChild(toast);

    // Auto-remove the notification after 2.5 seconds
    setTimeout(() => { if (toast) toast.remove(); }, 2500);
} 
// function to render the cart items into the cart page
function renderCart(){
    const cart = loadCart();
    const container = document.getElementById('cartItemsContainer');
    const emptyMsg = document.getElementById('emptyCartMsg');
    const cartActions = document.getElementById('cartActions');

    if(!container)return;
    
    if (cart.length === 0){
        container.innerHTML = '';
        if(emptyMsg){
            emptyMsg.style.display ='block';
            container.appendChild(emptyMsg); 
        }
        if(cartActions)cartActions.style.display ='none';
        updateSummary();
        return;
    }
    if(emptyMsg) emptyMsg.style.display ='none';
    if(cartActions) cartActions.style.display ='flex';
    //items
    container.innerHTML='';
    cart.forEach(function(item,index){
        const itemEl = document.createElement('div');
        itemEl.className='cart-item';
        itemEl.innerHTML = 
            '<div class="cart-item-icon">'+item.icon+'</div>'+
            '<div>' +
                '<div class="cart-item-name">'+item.name+'</div>' +
                '<div class="cart-item-price">J$' +item.price.toLocaleString()+ ' each</div>' +
                '</div>' +
                '<div class="qty-control">' +
                    '<button class="qty-btn" onclick="changeQty('+index+', -1)">&minus;</button>'+
                    '<span class="qty-num">'+item.quantity+'</span>'+
                    '<button class="qty-btn" onclick="changeQty('+index+', 1)">+</button>'+
                '</div>'+
                '<div class="subtotal">J$'+ (item.price * item.quantity).toLocaleString()+'</div>' +
                '<button class="remove-btn" onclick="removeItem(' +index+ ')" title="Remove item">&times;</button>';
        container.appendChild(itemEl);
    });
    //update count label
    const label = document.getElementById('itemCountLabel');
    if(label){
        const total = cart.reduce(function(s,i) {return s + i.quantity;},0);
        label.textContent = total+'item' +(total !== 1 ?'s':'');
    }
    updateSummary();
}
//function to increase and decrease cart quantity
//delta (number +1 or -1)
function changeQty(index, delta) {
    const cart = loadCart();
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    saveCart(cart);
    updateCartBadge();
    renderCart();
}
//function removes specific items from the cart 
function removeItem(index) {
    const cart = loadCart();
    cart.splice(index, 1);
    saveCart(cart);
    updateCartBadge();
    renderCart();
}
//function to clear the cart 
function clearCart(){
    saveCart([]);
    updateCartBadge();
    if (document.getElementById('cartItemsContainer')) renderCart();
}
//function to calculate & display subtotal, discount, tax, & total in the summary section
function updateSummary() {
    const cart = loadCart();
    const subtotal = cart.reduce(function(sum, item) {return sum + item.price * item.quantity;}, 0);
    const discountRate = 0.05;  // 5% discount
    const taxRate = 0.15;       // 15% GCT

    const discount = subtotal * discountRate;
    const afterDiscount = subtotal - discount;
    const tax = afterDiscount * taxRate;
    const total = afterDiscount + tax;

    function fmt(n) {
        try{
            return 'J$' + n.toLocaleString('en-JM', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); 
        }catch(e){
            return 'J$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }
    } 

    function el(id){return document.getElementById(id);}
    if (el('summarySubtotal')) el('summarySubtotal').textContent = fmt(subtotal);
    if (el('summaryDiscount')) el('summaryDiscount').textContent = '-'+fmt(discount);
    if (el('summaryTax'))      el('summaryTax').textContent      = fmt(tax);
    if (el('summaryTotal'))    el('summaryTotal').textContent    = fmt(total);
    if (el('checkoutTotal'))   el('checkoutTotal').textContent   = fmt(total);
    if (el('shipAmount'))      el('shipAmount').value            = total.toFixed(2);
}
//function smooth scrolling for the user 
function scrollToCheckout(){
    const section = document.getElementById('checkoutSection');
    if(section)section.scrollIntoView({behavior: 'smooth'});
}
//function to scroll back to the top of cart page (cancelling checkout)
function cancelCheckout(){
    window.scrollTo({top: 0, behavior: 'smooth'});
}
//function that validates checkout form fields
function handleCheckout() {
    let valid = true;

    // Helper to show/hide error
    function check(id, errId, condition) {
        const input = document.getElementById(id);
        const err = document.getElementById(errId);
        if (!condition) {
            if (input) input.classList.add('invalid');
            if (err) err.classList.add('show');
            valid = false;
        } else {
            if (input) input.classList.remove('invalid');
            if (err) err.classList.remove('show');
        }
    }

    check('shipFirstName', 'shipFirstErr', document.getElementById('shipFirstName') && document.getElementById('shipFirstName').value.trim() !== '');
    check('shipLastName', 'shipLastErr', document.getElementById('shipLastName') && document.getElementById('shipLastName').value.trim() !== '');
    check('shipAddress', 'shipAddErr', document.getElementById('shipAddress')&& document.getElementById('shipAddress').value.trim() !== '');
    check('shipCity', 'shipCityErr', document.getElementById('shipCity')&& document.getElementById('shipCity').value.trim() !== '');
    check('shipPhone', 'shipPhoneErr', document.getElementById('shipPhone')&& document.getElementById('shipPhone').value.trim() !== '');

    // Validate delivery date is in the future
    const dateInput = document.getElementById('shipDeliveryDate');
    const today = new Date().toISOString().split('T')[0];
    check('shipDeliveryDate', 'shipDateErr', dateInput && dateInput.value && dateInput.value > today);

    if (!valid) return;

    const cart = loadCart();
    if (cart.length === 0) {
        alert('Your cart is empty. Please add items before checking out.');
        return;
    }

    // Show confirmation, hide form
    document.getElementById('checkoutForm').style.display = 'none';
    document.getElementById('orderConfirmedMsg').style.display = 'block';
    clearCart();
    window.scrollTo({ top: document.getElementById('checkoutSection').offsetTop - 100, behavior: 'smooth' });
}
//function to validate custom order form 
function submitCustomOrder(){
    let valid = true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!document.getElementById('custName') || !document.getElementById('custName').value.trim()){
        showErr('custName', 'custNameErr'); valid = false;
    } else { clearErr('custName', 'custNameErr');}
    if (!document.getElementById('custPhone') || !document.getElementById('custPhone').value.trim()){
        showErr('custPhone', 'custPhoneErr'); valid = false;
    } else { clearErr('custPhone', 'custPhoneErr');}
    const email = document.getElementById('custEmail') ? document.getElementById('custEmail').value.trim(): '';
    if(!emailRegex.test(email)){
        showErr('custEmail', 'custEmailErr'); valid = false;
    } else { clearErr('custEmail', 'custEmailErr');}
    if (!document.getElementById('cakeType') || !document.getElementById('cakeType').value){
        showErr('cakeType', 'cakeTypeErr'); valid = false;
    } else { clearErr('cakeType', 'cakeTypeErr');}
    const dateVal = document.getElementById('deliveryDate') ? document.getElementById('deliveryDate').value.trim(): '';
    const today = new Date().toISOString().split('T')[0];    
    if(!dateVal || dateVal <= today){
        showErr('deliveryDate', 'dateErr'); valid = false;
    } else { clearErr('deliveryDate', 'dateErr');}
    if (!valid) return;

    const confirm = document.getElementById('orderConfirm');
    if (confirm){
        confirm.style.display ='block';
        document.getElementById('customOrderForm').reset();
    }
}
//function to switch between login & register 
function switchTab(tab) {
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const loginPanel = document.getElementById('loginPanel');
    const registerPanel = document.getElementById('registerPanel');

    if (!loginTab) return;

    if (tab === 'login') {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginPanel.classList.add('active');
        registerPanel.classList.remove('active');
    } else {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerPanel.classList.add('active');
        loginPanel.classList.remove('active');
    }
}
//function to validate login form fields 
function handleLogin() {
    let valid = true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const email = document.getElementById('loginEmail') ? document.getElementById('loginEmail').value.trim() : '';
    const password = document.getElementById('loginPassword') ? document.getElementById('loginPassword').value : '';

    // clear errors 
    clearErr('loginEmail', 'loginEmailErr');
    clearErr('loginPassword', 'loginPwErr');
    hideEl('loginNotFoundErr');
    hideEl('loginWrongPwErr');
    // Validate email format using regex
                    
    if (!emailRegex.test(email)) {
        showErr('loginEmail', 'loginEmailErr');
        valid = false;
    }

    // Validate password length
    if (!password || password.length < 6) {
        showErr('loginPassword', 'loginPwErr');
        valid = false;
    }

    if (!valid) return;

    //Check if email exists exists 
    const user = findUserByEmail(email);
    if(!user){
        showEl('loginNotFoundErr');
        showErr('loginEmail', 'loginEmailErr');
        return;
    }
    //Check if password matches what is stored 
    if(user.password !== password){
        showEl('loginWrongPwErr');
        showErr('loginPassword', 'loginPwErr');
        return;
    }

    // Show success message
    localStorage.setItem('doughliciousLoggedIn', JSON.stringify({name: user.firstName, email: user.email}));
    const success = document.getElementById('loginSuccess');
    if (success) {
        success.style.display = 'block';
        // Redirect after delay (simulated)
        setTimeout(function(){ window.location.href = 'index.html'; }, 1800);
    }
}
//function to validate registration fields
function handleRegister() {
    let valid = true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    hideEl('regEmailTakenErr');
    hideEl('regUsernameTakenErr');

    // First Name
    if (!document.getElementById('regFirstName')|| !document.getElementById('regFirstName').value.trim()) {
        showErr('regFirstName', 'regFirstErr'); valid = false;
    } else{ clearErr('regFirstName', 'regFirstErr'); }

    // Last Name
    if (!document.getElementById('regLastName')|| !document.getElementById('regLastName').value.trim()) {
        showErr('regLastName', 'regLastErr'); valid = false;
    } else{ clearErr('regLastName', 'regLastErr');}

    // DOB
    if (!document.getElementById('regDOB')|| !document.getElementById('regDOB').value) {
        showErr('regDOB', 'regDOBErr'); valid = false;
    } else{ clearErr('regDOB', 'regDOBErr');}

    // Email
    const regEmail = document.getElementById('regEmail')? document.getElementById('regEmail').value.trim() : '';
    if (!emailRegex.test(regEmail)) {
        showErr('regEmail', 'regEmailErr'); valid = false;
    } else{ clearErr('regEmail', 'regEmailErr');}

    // Username (minimum 3 characters)
    const username = document.getElementById('regUsername')?document.getElementById('regUsername').value.trim(): '';
    if (!username || username.length < 3) {
        showErr('regUsername', 'regUserErr'); valid = false;
    } else{ clearErr('regUsername', 'regUserErr');}

    // Password (minimum 6 characters)
    const pw = document.getElementById('regPassword')? document.getElementById('regPassword').value : '';
    if (!pw || pw.length < 6) {
        showErr('regPassword', 'regPwErr'); valid = false;
    } else {clearErr('regPassword', 'regPwErr');}

    // Confirm Password
    const cpw = document.getElementById('regConfirmPw')? document.getElementById('regConfirmPw').value : '';
    if (cpw !== pw) {
        showErr('regConfirmPw', 'regConfirmErr'); valid = false;
    } else {clearErr('regConfirmPw', 'regConfirmErr');}

    if (!valid) return;
    if (findUserByEmail(regEmail)){
        showEl('regEmailTakenErr');
        showErr('regEmail','regEmailErr');
        return;
    }
    const users = loadUsers();
    const usernameTaken = users.find(function(u){
        return u.username.toLowerCase() === username.toLowerCase();
    });
    if (usernameTaken){
        showEl('regUsernameTakenErr');
        showErr('regUsername', 'regUserErr');
        return;
    }

    users.push({
        firstName : document.getElementById('regFirstName').value.trim(),
        lastName : document.getElementById('regLastName').value.trim(),
        dob : document.getElementById('regDOB').value,
        email : regEmail,
        username : username, 
        password : pw
    });
    saveUsers(users);

    const success = document.getElementById('registerSuccess');
    if (success) {
        success.style.display = 'block';
        setTimeout(function() { switchTab('login');}, 2000);
    }
}
//function to toggle password (show/hide)
function togglePw(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '\uD83D\uDE48'; //closed
    } else {
        input.type = 'password';
        btn.textContent = '\uD83D\uDC41'; //open
    }
}

//function to add invalid class to input & show error
function showErr(inputId, errId) {
    const input = document.getElementById(inputId);
    const err = document.getElementById(errId);
    if (input) input.classList.add('invalid');
    if (err) err.classList.add('show');
}
//function to remove invalid class & hide error messages
function clearErr(inputId, errId) {
    const input = document.getElementById(inputId);
    const err = document.getElementById(errId);
    if (input) input.classList.remove('invalid');
    if (err) err.classList.remove('show');
}   
//funtion to show elements by id 
function showEl(id){
    const el = document.getElementById(id);
    if(el) el.classList.add('show');
}

//funtion to ide elements by id
function hideEl(id){
    const el = document.getElementById(id);
    if(el) el.classList.remove('show');
}
//function to filter products by category 
function filterProducts(category, btn) {
// Update  filter button to active
    document.querySelectorAll('.filter-btn').forEach(function(b){
        b.classList.remove('active');
    });
    if (btn) btn.classList.add('active');
    // Show/hide product cards based on category
    document.querySelectorAll('.product-card').forEach(function (card ) {
        card.style.display = (category === 'all' || card.dataset.category === category) ? 'block' : 'none';
    });
}

//function to toggle navigation menu (open or close)
function initHamburger() {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    if (!hamburger || !navLinks) return;

    hamburger.addEventListener('click', function () {
        navLinks.classList.toggle('open');
    });
}
// page loading
document.addEventListener('DOMContentLoaded', function () {
    updateCartBadge();
    initHamburger();

    // If on cart page, render the cart & update summary
    if (document.getElementById('cartItemsContainer')) {
        renderCart();
        updateSummary();
    }
});

// CSS animation(injected once)
var toastStyle = document.createElement('style');
toastStyle.textContent = 
    '@keyframes slideInToast {' +
    ' from { transform: translateX(100px); opacity: 0; }' +
    ' to   { transform: translateX(0);     opacity: 1; }' +
    '}';
document.head.appendChild(toastStyle);
