Template.logicForm.events({
	'click #expForm button': function(e) {
		e.preventDefault();

		var exp = $('#exp').val();
		LogicExpression.analyzeExpression(exp);
	}
});

LogicExpression = {
	subExpressions: Blaze.ReactiveVar([]),
	propositions: Blaze.ReactiveVar([]),
	tableRows: Blaze.ReactiveVar([]),


	regexps: {
		onlyLetters: /[a-z]/g,
		propositions: /~*[a-zFV]/g,
		subExpressions: /~*\([^)]+\)/g,
		operators: /E|OU|->|<->|XOU|~E|~OU/g,
		singleExpr: /\(?(~*[a-zFV])\s(E|OU|->|<->|XOU|~E|~OU)\s(~*[a-zFV])\)?/g,
		singleWithParentheses: /~*\(.\)/g
	},

	operators: {
		E: function(p, q){
			return (p == 'V' && q == 'V') ? 'V' : 'F';
		},

		OU: function(p, q){
			return (p == 'V' || q == 'V') ? 'V' : 'F';
		},

		XOU: function(p, q){
			return (p != q) ? 'V' : 'F';
		},

		'~': function(p){
			if(p == 'V') return 'F';
			else if(p == 'F') return 'V';
		},

		'->': function(p, q){
			return (p == 'V' && q == 'F') ? 'F' : 'V';
		},

		'<->': function(p, q){
			if( (p == 'V' && q == 'V') || (p == 'F' && q == 'F')) return 'V';
			else return 'F';
		},

		'~E': function(p, q){
			return (p == 'F' && q == 'F') ? 'V' : 'F';
		},

		'~OU': function(p, q){
			return (p == 'F' || q == 'F') ? 'V' : 'F';
		}
	},

	exp: Blaze.ReactiveVar(''),

	evalSingleExpr: function(expression, propositionsVals){
		var operators = expression.match(LogicExpression.regexps.operators),
			propsToUse = {},
			props = expression.match(LogicExpression.regexps.propositions)

		if(/V|F/g.test(expression)){
			var standalones = expression.match(/V|F/g);
			_.each(standalones, function(standalone){
				propositionsVals[standalone] = standalone;
			});
		}

		console.log(expression, propositionsVals);

		_.each(props, function(proposition){
			if(_.contains(proposition, '~')){
				proposition = proposition.replace('~', '');
				propsToUse[proposition] = LogicExpression.operators['~'](propositionsVals[proposition])
				console.log('~ detected for', proposition);
				console.log(propsToUse[proposition]);
			} else {
				propsToUse[proposition] = propositionsVals[proposition];
			}
		});

		if(operators){
			var operator = operators[0];

			var propositions = expression.split(operators);
			console.log('propositions', propositions)
			if(propositions.length > 1){
				return LogicExpression.operators[operator].apply(this, _.values(propsToUse));
			}
		} else return Error("Can't evaluate the expression.");
	},

	evalAllExpr: function(expressions, propositionsVals){
		// TODO: Parentheses not working	
		var evaled = expressions.replace(LogicExpression.regexps.singleExpr, function(singleExpr){
			return LogicExpression.evalSingleExpr(singleExpr, propositionsVals);
		});

		if(LogicExpression.hasSingleExpr(evaled)){
			return LogicExpression.evalAllExpr(evaled, propositionsVals);
		}

		return evaled;
	},

	hasSingleExpr: function(exp){
		return LogicExpression.regexps.singleExpr.test(exp);	
	},

	analyzeExpression: function(exp){
		this.exp.set(exp);
		this.setPropositions(exp);
		this.setSubExpressions(exp);

		this.makeRows();
	},

	setPropositions: function(exp){
		var letters = [];
		
		exp.replace(LogicExpression.regexps.onlyLetters, function(letter){
			if( !_.contains(letters, letter) ) letters.push(letter);
			return letter;
		});

		return LogicExpression.propositions.set(letters);
	},

	setSubExpressions: function(exp){
		var subexps = exp.match(LogicExpression.regexps.singleExpr);
		subexps.push(exp);

		return LogicExpression.subExpressions.set(subexps);
	},

	makeRows: function(){
		var rowsLength = Math.pow(2, LogicExpression.propositions.get().length),
			propositionsRows = {},
			propositionsLastVal = {},
			rows = [];

		var propositions = LogicExpression.propositions.get(),
			subExpressions = LogicExpression.subExpressions.get();

		// Creating the range TRUE or FALSE for propositions
		_.each(propositions, function(proposition, i){
			i+=1;
			var rate = rowsLength/Math.pow(2, i);
			propositionsRows[proposition] = [];
			_.times(rowsLength/(rate*2), function(){
				_.times(rate, function(){
					propositionsRows[proposition].push('V');
				});

				_.times(rate, function(){
					propositionsRows[proposition].push('F');
				});
			});
		});

		_.times(rowsLength, function(i){
			var row = [];

			_.each(propositions, function(proposition){
				row.push(propositionsLastVal[proposition] = propositionsRows[proposition][i]);
			});

			_.each(subExpressions, function(subExpressions){
				row.push(LogicExpression.evalAllExpr(subExpressions, propositionsLastVal));
			});

			rows.push(row);
		});

		return LogicExpression.tableRows.set(rows);
	}
}

Template.truthTable.helpers({
	logicExp: function(){
		return LogicExpression.exp.get();
	},

	propositions: function(){
		return LogicExpression.propositions.get();
	},

	subExpressions: function(){
		return LogicExpression.subExpressions.get();
	},

	tableRows: function(){
		return LogicExpression.tableRows.get();
	}
});