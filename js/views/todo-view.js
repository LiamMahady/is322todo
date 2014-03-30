/*global Backbone, jQuery, _, ENTER_KEY, ESC_KEY */
var app = app || {};

Backbone.View.prototype.isValidDateString=function(str)//for some reason Date has no method for this and we need SOME way to verify that we're getting input that won't cause errors
  {if (isNaN(Date.parse(str)))
    {return false;
    }
  else
    {return true;
    }
  };

(function ($) {
	'use strict';

	// Todo Item View
	// --------------

	// The DOM element for a todo item...
	app.TodoView = Backbone.View.extend({
		//... is a list tag.
		tagName:  'li',

		// Cache the template function for a single item.
		template: _.template($('#item-template').html()),

		// The DOM events specific to an item.
		events: {
			'click .toggle': 'toggleCompleted',
			'dblclick .title': 'edit',
			'dblclick .date': 'editDate',
			'click .destroy': 'clear',
			'keypress .edit': 'updateOnEnter',
			'keydown .edit': 'revertOnEscape',
			'blur .edit': 'close',
			'dragend label': 'toggleCompletedSwipe'//for some reason this works much more reliably than swipe
		},

		// The TodoView listens for changes to its model, re-rendering. Since
		// there's a one-to-one correspondence between a **Todo** and a
		// **TodoView** in this app, we set a direct reference on the model for
		// convenience.
		initialize: function () {
			this.listenTo(this.model, 'change', this.render);
			this.listenTo(this.model, 'destroy', this.remove);
			this.listenTo(this.model, 'visible', this.toggleVisible);
			this.$el.hammer({drag_block_horizontal: true});
			this.delegateEvents();//we seem to need to redelegate after enabling hammer
		},
		
		formatDates: function(attr)
		  {if (Modernizr.inputtypes.date)
		    {var dateDisp=new Date(attr.date);
		    //data is stored in GMT while the string outputs it in local time
		    //so we need to correct for that
		    dateDisp.setMinutes(dateDisp.getMinutes()+dateDisp.getTimezoneOffset());
		    attr.dateDisp=dateDisp.toLocaleDateString();
		    attr.date=attr.date.substr(0,10);
		    }
		  else
		    {var date=new Date(attr.date);
		    var dateStr=date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear();
		    attr.date=dateStr;
		    attr.dateDisp=dateStr;
		    }
		  return attr;
		  },
		
		// Re-render the titles of the todo item.
		render: function () {
			// Backbone LocalStorage is adding `id` attribute instantly after
			// creating a model.  This causes our TodoView to render twice. Once
			// after creating a model and once on `id` change.  We want to
			// filter out the second redundant render, which is caused by this
			// `id` change.  It's known Backbone LocalStorage bug, therefore
			// we've to create a workaround.
			// https://github.com/tastejs/todomvc/issues/469
			if (this.model.changed.id !== undefined) {
				return;
			}

			this.$el.html(this.template(this.formatDates(this.model.toJSON())));
			this.$el.toggleClass('completed', this.model.get('completed'));
			this.toggleVisible();
			this.$input = this.$('.edit');
			return this;
		},

		toggleVisible: function () {
			this.$el.toggleClass('hidden', this.isHidden());
		},

		isHidden: function () {
			var isCompleted = this.model.get('completed');
			return (// hidden cases only
				(!isCompleted && app.TodoFilter === 'completed') ||
				(isCompleted && app.TodoFilter === 'active')
			);
		},

		// Toggle the `"completed"` state of the model.
		toggleCompleted: function () {
			this.model.toggle();
		},
		
		//Toggle completed with some additional touch functionality
		toggleCompletedSwipe: function(event)
		  {if (Math.abs(event.gesture.deltaX/event.gesture.deltaTime) > 0.3)//hammer seems inconsitent in reporting the velocity so we have to calculate it here
		    {this.model.toggle();
		    }
		  },

		// Switch this view into `"editing"` mode, displaying the input field.
		edit: function () {
			this.$el.addClass('editing');
			this.$el.addClass('editingTitle');
			this.$(".titleEdit").show();
			this.$(".titleEdit").focus();
			this.$(".dateEdit").hide();
		},
		//just a copy of edit
		editDate: function()
		  {this.$el.addClass('editing');
		  this.$el.addClass('editingDate');
		  this.$(".dateEdit").show();
		  this.$(".dateEdit").focus();
		  this.$(".titleEdit").hide();
		  },

		// Close the `"editing"` mode, saving changes to the todo.
		close: function () {
			var value = this.$(".titleEdit").val();
			var trimmedValue = value.trim();
			var dateVal=this.$(".dateEdit").val();
			var trimmedDateVal=dateVal.trim();

			// We don't want to handle blur events from an item that is no
			// longer being edited. Relying on the CSS class here has the
			// benefit of us not having to maintain state in the DOM and the
			// JavaScript logic.
			if (!this.$el.hasClass('editing')) {
				return;
			}

			if (trimmedValue) {
				this.model.save({ title: trimmedValue});

				if (value !== trimmedValue) {
					// Model values changes consisting of whitespaces only are
					// not causing change to be triggered Therefore we've to
					// compare untrimmed version with a trimmed one to check
					// whether anything changed
					// And if yes, we've to trigger change event ourselves
					this.model.trigger('change');
				}
			} else {
				this.clear();
			}
			if (trimmedDateVal && this.isValidDateString(trimmedDateVal))
			  {this.model.save({date:trimmedDateVal});
			  if (dateVal!==trimmedDateVal)
			    {this.model.trigger('change');
			    }
			  }

			this.$el.removeClass('editing');
			this.$el.removeClass('editingTitle');
			this.$el.removeClass('editingDate');
			this.$(".titleEdit").hide();
			this.$(".dateEdit").hide();
			
		},

		// If you hit `enter`, we're through editing the item.
		updateOnEnter: function (e) {
			if (e.which === ENTER_KEY) {
				this.close();
			}
		},

		// If you're pressing `escape` we revert your change by simply leaving
		// the `editing` state.
		revertOnEscape: function (e) {
			if (e.which === ESC_KEY) {
				this.$el.removeClass('editing');
			}
		},

		// Remove the item, destroy the model from *localStorage* and delete its view.
		clear: function () {
			this.model.destroy();
		}
	});
})(jQuery);
