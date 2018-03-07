//budget controller --> this is module pattern (this one handles the budget data)
var budgetController = (function(){

    //created data model for both income and expenses. Each item has description and value
    //capital letter becuase it is func constructor
    var Expense = function (id, description, value) {
        this.id=id;
        this.description=description;
        this.value=value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(current) {
            sum += current.value;
        });
        data.totals[type] = sum;
    }
    //inc and exp items are stored here
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1,
    };

    return {
        addItem: function (type, des, val) {
            var newItem, ID;
             //ID is set to zero for now
            //ID = 0;

            //Create a new ID
            //at the beggining we have no data in array, so to prevent errors we had to create if statement
            //if the array has more than zero elements, the code below for if will execute
            if (data.allItems[type].length > 0) {   

                //now we want to pick the last item from data.allItems
                //retrieve id by .id at the end of the line 
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {                
                //when the array is empty, the value of ID is zero
                ID=0;
            }

            //Create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            //Push it into our data variable structure
            //now because our exp/inc from addItem function constructor is similar to arrays from data variable, we can push new element = new Expense/Income to data variable 
            data.allItems[type].push(newItem);
            
            // Return the new element
            return newItem; //return the result so it can be accessed by other module/function
        },
        deleteItem: function(type, id) {
            var ids = data.allitems[type].map(function(current) {
                return current.id;
            });

            var index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function() {
            //calculate total inc and exp
            calculateTotal('exp');
            calculateTotal('inc');

            //calc the budget
            data.budget = data.totals.inc - data.totals.exp;

            //calc the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function() {
            data.allItems.exp.forEach(function(current) {
                current.calcPercentage(data.totals.inc);
            })
        },

        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },
        //created method to see if the data variable works
        testing: function() {
            console.log(data);
        }
    };

})();

//UI controller
var UIController = (function() {
    
    var DOMstrings = {
        //to make things easier, put all of the strings from doms into method (think like in .less) so you dont need to change the class name in every dom string
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLable: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month',
    };

    var NodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: function() {
            return {
                //return object cuz we want to receive back all the values from down
                type: document.querySelector(DOMstrings.inputType).value, 
                //^ .value is property which sets or returns the value of the value attribute of a text field. This one returnd the value, it will be either inc or exp (check html file)
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
            };
        },

        addListItem: function(obj, type) {
            var html, newHtml, element;
            //create html string with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            //replace the placeholder text with actual data
            newHtml = html.replace("%id%", obj.id); 
            newHtml = newHtml.replace("%description%", obj.description);
            newHtml = newHtml.replace("%value%", this.formatNumber(obj.value, type));

            //insert the html into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function(selectorID) {
            var element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);
        },

        clearFields: function() {
            var fields;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            //this tricks slice method that it is already in array
           var fieldsArr =  Array.prototype.slice.call(fields);

           fieldsArr.forEach(function (current, index, array) {
               current.value = "";
            fieldsArr[0].focus();
           });
        },
        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent =  this.formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = this.formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLable).textContent = this.formatNumber(obj.totalInc, 'exp');
            document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage;

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },

        displayPercentages: function(percentages) {
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            // var NodeListForEach = function(list, callback) {
            //     for (var i = 0; i < list.length; i++) {
            //         callback(list[i], i);
            //     }
            // };
            
            NodeListForEach(fields, function(current, index){
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },

        formatNumber: function(num, type) {
            var type;

            num = Math.abs(num);
            num = num.toFixed(2);
            var numSplit = num.split('.');
            var int = numSplit[0];
            var dec = numSplit[1];

            if (int.length > 3) {
                var int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
            }            

            return (type === 'exp' ?  '-' : '+') + ' ' + int + '.' + dec;
        },

        displayMonth: function() {
          var now = new Date();  
          
          var year = now.getFullYear();
          var month = now.getMonth();

          var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
          document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changedType: function() {
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' + 
                DOMstrings.inputDescription + ',' + 
                DOMstrings.inputValue);

            NodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
            });
        },

        getDOMstrings: function() {
            return DOMstrings; //expose private DOMstrings by method function which returns DOMstrings into the public. It can be used by controller module.
        }
    };

})(); 


//Global App Controller
var controller = (function(budgetCtrl, UICtrl){ //added parameters budgetCtrl, UICtrl so this module knows about the other two -->go at the end of this iife

    var setupEventListeners = function() { //created a function to make things more clean, now we have only functions inside controller IIFE. You need to call this function by another function (check bellow return method function init)      
        var DOM = UICtrl.getDOMstrings();
        
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem); 
        //using only DOM because the DOMstrings has been renamed to DOM ^check above    
        document.addEventListener('keypress', function(event) {
             if (event.keyCode === 13 || event.which === 13) { 
                //older browsers use event.which instead of keyCode
                ctrlAddItem();
             }     
        });  
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);   
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };

    var updatePercentages = function() {
        // 1. calc percentages
        budgetCtrl.calculatePercentages();
        // 2. read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();
        // 3. update the UI with the new percentages
        console.log(percentages);
        UIController.displayPercentages(percentages);
    };

    var updateBudget = function() {
        //1. calc the budget
        budgetCtrl.calculateBudget();
        //2. return the budget
        var budget = budgetCtrl.getBudget();
        //3. display the budget
       UICtrl.displayBudget(budget);
    };
    
    var ctrlAddItem = function() {
        var input, newItem;
        //created custom function in order to go along the Dont Repeat Yourself principle, look where ctrlAddItem is used

        // to do list 
        //1. get the field input data
        input = UICtrl.getInput(); //calling the function method getInput from UIController

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            //2. add the item to the budget controller
            //input. look on the line above for the input value
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //3. add the item to the UI 
            UICtrl.addListItem(newItem, input.type);

            //4. clear the fields
            UICtrl.clearFields();
            
            //5. calc and update budget
            updateBudget();

            // 6. calc and update percentages
            updatePercentages();
        }        
    };

    var ctrlDeleteItem = function(event) {
        // console.log(event.target.parentNode);
        //hardcoded DOM structure
        var itemId, splitId, type, id;
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemId) {
            splitId = itemId.split('-');
            type = splitId[0];
            id = parseInt(splitId[1]);
            // 1. delete the item from the data structure
            budgetCtrl.deleteItem(type, id);
            // 2. delete the item form the UI
            UICtrl.deleteListItem(itemId);
            // 3. update and show the new budget
            updateBudget();
            // 4. update percentages
            updatePercentages();
        }
    }
    
    return {
        init: function() {
            console.log('App has started.');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1,
            });
            setupEventListeners();
        }
    };
})(budgetController, UIController);


controller.init(); //we need to call the init function, w/o this line no event listeners from controller function will be called.