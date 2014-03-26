/*global Backbone */
var app = app || {};

Backbone.Model.prototype.toJSON=function()
  {return this._parseDates(this.attributes);
  };
Backbone.Model.prototype._parseDates=function(attrs)
  {attrs=_.clone(attrs);
  var newDate=attrs.date.split("/").reverse().join("/");
  attrs.date=new Date(newDate).toISOString();
  return attrs;
  };

(function () {
	'use strict';

	// Todo Model
	// ----------

	// Our basic **Todo** model has `title`, `order`, and `completed` attributes.
	// We'll go ahead and add a date attribute
	app.Todo = Backbone.Model.extend({
		// Default attributes for the todo
		// and ensure that each todo created has `title` and `completed` keys.
		defaults: {
			title: '',
			completed: false,
			date: ''
		},

		// Toggle the `completed` state of this todo item.
		toggle: function () {
			this.save({
				completed: !this.get('completed')
			});
		}
	});
})();
