/*global Backbone */
var app = app || {};

(function () {
	'use strict';

	// Todo Collection
	// ---------------

	// The collection of todos is backed by *localStorage* instead of a remote
	// server.
	var Todos = Backbone.Collection.extend({
		// Reference to this collection's model.
		model: app.Todo,

		// Save all of the todo items under the `"todos"` namespace.
		localStorage: new Backbone.LocalStorage('todos-backbone'),

		//listen for any changes in date that will require a resort
		initialize: function()
		  {this.on
		  ("change:date", function()
		    {this.sort();
		    }
		  );
		  },
		
		// Filter down the list of all todo items that are finished.
		completed: function () {
			return this.filter(function (todo) {
				return todo.get('completed');
			});
		},

		// Filter down the list to only todo items that are still not finished.
		remaining: function () {
			return this.without.apply(this, this.completed());
		},

		// Todos are sorted by their date attribute.
		comparator: function (todo) {
		  var date=new Date(todo.get('date'));
			return date.getTime();
		}
	});

	// Create our global collection of **Todos**.
	app.todos = new Todos();
})();
