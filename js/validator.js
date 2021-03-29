
//Constructor function , đối tượng " Validator"
function Validator(options){

    var selectorRules = {};

    function validate(inputElement, rule) {
        var errorElement = inputElement.parentElement.querySelector(options.errorSelector);
        var errorMessage;

        //lấy ra các rule của selector
        var rules = selectorRules[rule.selector];

        //lặp qua từng rule & kiểm tra
        //nếu có lỗi thì dừng việc kiểm tra
        for(var rule of rules){
            errorMessage = rule(inputElement.value);
            if(errorMessage) break;
        }

        if(errorMessage){
            errorElement.innerText = errorMessage;
            inputElement.parentElement.classList.add('invalid');
        }else{
            errorElement.innerText = '';
            inputElement.parentElement.classList.remove('invalid');
        }

        return !!errorMessage; // 2 dấu !! là dùng để chuyển sang dạng bool
    }

    //lấy element của form cần validate
    var formElement = document.querySelector(options.form);

    if(formElement){
        //khi submit form
        formElement.onsubmit = function(e) {
            e.preventDefault();

            var isFormValid = true;

            options.rules.forEach(rule => {
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule);
                if(isValid){
                    isFormValid = false;
                }
            })

            if(isFormValid){
                //Trường hợp submit với javascript
                if(typeof options.onSubmit == 'function'){
                    var enableInputs = formElement.querySelectorAll('[name]:not([disabled])');//[...] attribute selector
                    var formValues   = Array.from(enableInputs).reduce(function(values, input) {
                        return (values[input.name] = input.value) && values;//đầu tiên nó gán đã xong cuối cùng nó return values
                    }, {});                    
                    options.onSubmit(formValues);
                }
                //Trường hợp submit với hành vi mặc định
                else{
                    formElement.submit();
                }
            }
            
        }

        //lặp qua các rule và xử lý( lăng nghe sự kiện ...)
        options.rules.forEach(rule => {

            //Lưu lại các rule cho mỗi input
            if(Array.isArray(selectorRules[rule.selector])){
                selectorRules[rule.selector].push(rule.test);
            }else{
                selectorRules[rule.selector] = [rule.test];
            }

            var inputElement = formElement.querySelector(rule.selector);
            if(inputElement){

                //xử lý trường hợp blue ra khỏi input
                inputElement.onblur = function() { //blur trái ngược với focus
                    validate(inputElement, rule);
                }

                //xử lý khi người dùng nhập vào input
                inputElement.oninput = function() {                    
                        inputElement.parentElement.querySelector(options.errorSelector).innerText = '';
                        inputElement.parentElement.classList.remove('invalid');
                }
            }
        });
    }
}

//Định nghĩa Rules
//Nguyên tắc các RULES
//1. Khi có lỗi => trả ra message lỗi
//2. Khi hợp lệ => Không trả ra cái gì cả

Validator.isRequired = function(selector, message) {
    return {
        selector : selector,
        test : function(value) {//đùng để check
            return value.trim() ? undefined : message || 'Vui lòng nhập trường này';
        }
    }
}

Validator.isEmail = function(selector, message) {
    return {
        selector : selector,
        test : function(value) {//đùng để check
            var regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
            return regex.test(value)? undefined : message || 'Trường này phải là email';
        }
    }
}


Validator.minLength = function(selector, min, message) {
    return {
        selector : selector,
        test : function(value) {//đùng để check
            return value.length >= min ? undefined :message ||`Vui lòng nhập tối thiểu 6 kí tự`;
        }
    }
}

Validator.isConfirmed = function(selector, getConfirmValue, message) {
    return {
        selector: selector,
        test : function(value) {
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác';
        }
    }
}