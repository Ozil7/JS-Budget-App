//------------------------------------------------------------------------------------------------------
var budgetController = (function() {

	var Expense = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	}
	
	var Income = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	}

	Expense.prototype.calcPercentage = function(totalIncome) {
		if (totalIncome > 0) {
			this.percentage = Math.round(this.value / totalIncome * 100);
		} else {
			this.percentage = -1;
		}
	}

	var data = {
		allItems: {
			exp: [],
			inc: []
		},
		total: {
			exp: 0,
			inc: 0
		},
		budget: 0,
		percentage: -1
	};

	var calculateTotal = function(type) {
		var sum = 0
		data.allItems[type].forEach(function(current) {
			sum += current.value;
		});
		data.total[type] = sum;
	}

	return {
		addItem: function (type, description, value) {
			var newItem, ID;
			if (data.allItems[type].length === 0) {
				ID = 0;
			} else {
				ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
			}

			if (type == 'inc') {
				newItem = new Income(ID, description, value);
			} else {
				newItem = new Expense(ID, description, value);
			}
			data.allItems[type].push(newItem);
			return newItem;
		},

		deleteItem: function(type, id) {
			var ids, idIndex;

			ids = data.allItems[type].map(function(current) {
				return current.id;
			});
			idIndex = ids.indexOf(id);
			data.allItems[type].splice(idIndex, 1);
		},

		calculateBudget: function() {
			calculateTotal('inc');
			calculateTotal('exp');

			data.budget = data.total.inc - data.total.exp;
			data.percentage = (data.total.inc === 0) ? -1 : (Math.round(data.total.exp / data.total.inc * 100));
		},

		getBudget: function() {
			return {
				totalExp: data.total.exp,
				totalInc: data.total.inc,
				budget: data.budget,
				percentage: data.percentage
			}
		},

		calculatePercentages: function() {
			data.allItems.exp.forEach(function(current) {
				current.calcPercentage(data.total.inc);
			});
		},

		getPercentages: function() {
			var perc = data.allItems.exp.map(function(current) {
				return current.percentage;
			});
			return perc;
		},

		testing: function() {
			console.log(data);
		}
	}
})();








//-----------------------------------------------------------------------------------------------------------------
var UIController = (function() {
	var DOMstrings = {
		inputType: '.add__type',
		description: '.add__description',
		inputValue: '.add__value',
		inputButton: '.add__btn',
		incomeContainer: '.income__list',
		expenseContainer: '.expenses__list',
		totIncLabel: '.budget__income--value',
		totExpLabel: '.budget__expenses--value',
		totBudgetLabel: '.budget__value',
		totPercLabel: '.budget__expenses--percentage',
		container: '.container',
		expensePercLabel: '.item__percentage',
		monthLabel: '.budget__title--month'		
	}

	var formatNumber = function(num, type) {
		var numSplit, int, dec, finalInt;

		num = Math.abs(num);
		num = num.toFixed(2);
		numSplit = num.split('.');
		int = numSplit[0];
		dec = numSplit[1];

		if (int.length > 3) {
			finalInt = int.substring(0, int.length - 3) + ',' + int.substring(int.length - 3, 3);
		} else {
			finalInt = int;
		}

		return (type === 'inc' ? '+' : '-') + finalInt + '.' + dec;
	}

	var nodeListForEach = function(list, callback) {
		for (var i=0; i<list.length; i++) {
			callback(list[i], i);
		}
	}

	return {
		getInput: function() {
			return {
				type: document.querySelector(DOMstrings.inputType).value,
				description: document.querySelector(DOMstrings.description).value,
				value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
			};
		},

		addItem: function(item, type) {
			var html, newHtml, element;

			//Create HTML text with placehlder
			if (type === 'inc') {
				element = DOMstrings.incomeContainer;
				html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			} else {
				element = DOMstrings.expenseContainer;
				html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}

			//Replace placeholder with actual data
			newHtml = html.replace('%id%', item.id);
			newHtml = newHtml.replace('%description%', item.description);
			newHtml = newHtml.replace('%value%', formatNumber(item.value, type));

			//Add new html to DOM
			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
		},

		deleteItem: function(id) {
			var el = document.getElementById(id);
			el.parentNode.removeChild(el);
		},

		clearFields: function() {
			var fields, fieldsArr;
			fields = document.querySelectorAll(DOMstrings.description + ', ' + DOMstrings.inputValue);

			fields.forEach(function(current, index, array) {
				current.value = "";
			});

			fields[0].focus();
		},

		displayBudget: function(obj) {
			var type;
			type = obj.budget >= 0 ? 'inc' : 'exp';
			document.querySelector(DOMstrings.totBudgetLabel).textContent = formatNumber(obj.budget, type);
			document.querySelector(DOMstrings.totIncLabel).textContent = formatNumber(obj.totalInc, 'inc');
			document.querySelector(DOMstrings.totExpLabel).textContent = formatNumber(obj.totalExp, 'exp');

			if (obj.percentage > 0) {
				document.querySelector(DOMstrings.totPercLabel).textContent = obj.percentage + '%';
			} else {
				document.querySelector(DOMstrings.totPercLabel).textContent = '---';
			}
		},

		displayPercentages: function(percentages) {
			var fields = document.querySelectorAll(DOMstrings.expensePercLabel);

			nodeListForEach(fields, function(current, index) {
				if (percentages[index] > 0) {
					current.textContent = percentages[index] + '%';
				} else {
					current.textContent = '---';
				}
			});
		},

		displayMonth: function() {
			const monthNames = ["January", "February", "March", "April", "May", "June",
			  "July", "August", "September", "October", "November", "December"
			];

			var date = new Date();
			document.querySelector(DOMstrings.monthLabel).textContent = monthNames[date.getMonth()] + ' ' + date.getFullYear();
		},

		changeType: function() {
			var fields = document.querySelectorAll(DOMstrings.inputType + ', ' + DOMstrings.description + ', ' + DOMstrings.inputValue);

			nodeListForEach(fields, function(current, index) {
				current.classList.toggle('red-focus');
			});

			document.querySelector(DOMstrings.inputButton).classList.toggle('red');
		},

		getDomStrings: function() {
			return DOMstrings;
		}
	}

})();







//-----------------------------------------------------------------------------------------------------------
var controller = (function(budgetCtrl, UICtrl) {

	//Setup event listeners for dom
	var setUpEventListeners = function() {
		var DOM = UICtrl.getDomStrings();

		document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);

		document.addEventListener('keypress', function(event) {
			if (event.keyCode === 13 || event.which === 13) {
				ctrlAddItem();
			}
		});

		document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);

		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
	}

	var updateBudget = function() {
		//Calculate budget
		budgetCtrl.calculateBudget();

		//Get total budget
		var budget = budgetCtrl.getBudget();

		//Update UI with budget
		UICtrl.displayBudget(budget);
	}

	var updatePercentages = function() {
		//Calculate percentages
		budgetCtrl.calculatePercentages();

		//Get percentages
		var percentages = budgetCtrl.getPercentages();

		//Update UI with percentages
		UICtrl.displayPercentages(percentages);
	}
	
	var ctrlAddItem = function() {
		var input, newItem;

		//Get input from dom
		input = UICtrl.getInput();

		if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
			//Add input values to budget controller		
			newItem = budgetCtrl.addItem(input.type, input.description, input.value);

			//Add input to UI
			UICtrl.addItem(newItem, input.type);

			//Clear the input fields
			UICtrl.clearFields();

			//Calculate budget
			updateBudget();

			//Calculate percentages
			updatePercentages();
		}
	}

	var ctrlDeleteItem = function(event) {
		var id, splitID, type, ID;

		id = event.target.parentNode.parentNode.parentNode.parentNode.id;
		splitID = id.split('-');
		type = splitID[0];
		ID = parseInt(splitID[1]);

		budgetCtrl.deleteItem(type, ID);

		UICtrl.deleteItem(id);

		updateBudget();

		updatePercentages();
	}

	return {
		init: function() {
			console.log('App has started');
			UICtrl.displayMonth();
			UICtrl.displayBudget({
				totalExp: 0,
				totalInc: 0,
				budget: 0,
				percentage: -1
			});
			setUpEventListeners();
		}
	}

})(budgetController, UIController);

controller.init();