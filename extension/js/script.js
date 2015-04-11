(function(){

  /**
   * Constant values to make life easier
   * @type {Object}
   */
  var CONSTANTS = {
    TOKEN: 'DB76SJDUSQFFHVNSQC6Y',
    API_ENDPOINT: 'https://www.eventbriteapi.com/v3/events/search/',
    POSTDATA_DATE_FORMAT: 'YYYY-MM-DDTHH:mm:ss[Z]',
    EVENT_DISPLAY_DATE_FORMAT: 'ddd, MMM D h:mm A'
  }
  /*
  storage: to access chrome extension local storage
            local is preferred over sync because of storage limit
  mountNode: reference to main container for react to load the app
   */
  var storage = chrome.storage.local,
      mountNode = document.getElementById('app'),
      locationName = '', locationData = [], locationRadius,
      popularEvents = '', nextWeekendEvents = '';
  /**
   * EventsList is the <ul></ul> container for the application that
   * stores the list of events
   */
  var ____Class0=React.Component;for(var ____Class0____Key in ____Class0){if(____Class0.hasOwnProperty(____Class0____Key)){EventsList[____Class0____Key]=____Class0[____Class0____Key];}}var ____SuperProtoOf____Class0=____Class0===null?null:____Class0.prototype;EventsList.prototype=Object.create(____SuperProtoOf____Class0);EventsList.prototype.constructor=EventsList;EventsList.__superConstructor__=____Class0;function EventsList(){"use strict";if(____Class0!==null){____Class0.apply(this,arguments);}}
    /**
     * Click handler for each event list item
     * Opens a chrome tab on click
     * @param  {clickevent} e
     * @return
     */
    Object.defineProperty(EventsList.prototype,"handleClick",{writable:true,configurable:true,value:function(e){"use strict";
      e.preventDefault();
      chrome.tabs.create({ url: $(e.currentTarget).attr('href') });
    }});
    /**
     * Render in EventsList Component receives list of events and also the
     * locationName so that this component knows when to display empty
     * event items message
     * @return {[type]} [description]
     */
    Object.defineProperty(EventsList.prototype,"render",{writable:true,configurable:true,value:function() {"use strict";
      if(this.props.events.length == 0 && $.trim(this.props.locationName) != ''){
        return React.createElement("div", {className: "no-events-found"}, 
          React.createElement("span", null, "Whoops! No events found.")
        );
      }else{
        var events = this.props.events.map(function(event){
          var startDate = moment(event.start.local).format(CONSTANTS.EVENT_DISPLAY_DATE_FORMAT); // converts the date to a beautiful format
          var endDate = moment(event.end.local).format(CONSTANTS.EVENT_DISPLAY_DATE_FORMAT);
          var address = [];
          if(event.venue.address.city) address.push(event.venue.address.city);
          if(event.venue.address.region) address.push(event.venue.address.region);
          if(!event.hasOwnProperty("logo_url")){ /* For old apps so that they don't throw errors */
            var imageStyle = {
              backgroundImage: 'url('+((event.logo) ? event.logo.url : '' )+')'
            };
          }else{
            var imageStyle = {
              backgroundImage: 'url('+((event.logo_url) ? event.logo_url : '' )+')'
            };
          }
          return React.createElement("li", {key: event.id, className: "event-container"}, 
            React.createElement("a", {href: event.url, onClick: this.handleClick}, 
              React.createElement("div", {className: "event"}, 
                React.createElement("div", {className: "image", style: imageStyle, "data-adaptive-background": "1", "data-ab-css-background": "1"}), 
                React.createElement("div", {className: "body"}, 
                  React.createElement("span", {className: "title"}, event.name.text), 
                  React.createElement("span", {className: "organizer"}, event.organizer.name), 
                  React.createElement("span", {className: "date"}, startDate), 
                   (address.length > 0 ) ? (React.createElement("span", {className: "address"}, address.join(", "))) : ''
                )
              )
            )
          );
        }, this);
        return React.createElement("div", null, 
          React.createElement("ul", {className: "events-list"}, 
            events
          )
          /*<div className="show-more">
            Show more ...
          </div>*/
        );
      }
    }});
  

  /**
   * App: Main application which contains the title, search bar, options and the results
   */

  var ____Class1=React.Component;for(var ____Class1____Key in ____Class1){if(____Class1.hasOwnProperty(____Class1____Key)){App[____Class1____Key]=____Class1[____Class1____Key];}}var ____SuperProtoOf____Class1=____Class1===null?null:____Class1.prototype;App.prototype=Object.create(____SuperProtoOf____Class1);App.prototype.constructor=App;App.__superConstructor__=____Class1;
    function App(props){"use strict";
      ____Class1.call(this,props);
      this.state = {
        events: props.locationData,
        location: props.locationName,
        radius: props.locationRadius,
        popularEvents: props.popularEvents,
        nextWeekendEvents: props.nextWeekendEvents
      };
    }
    Object.defineProperty(App.prototype,"getData",{writable:true,configurable:true,value:function(prediction, radius, popularEvents, nextWeekendEvents){"use strict";
      var self = this;
      var postData = {
        'location.address': prediction,
        'location.within': radius + 'mi',
        'token': CONSTANTS.TOKEN
      };
      if(popularEvents){
        postData['popular'] = 'on';
      }
      if(nextWeekendEvents){
        var range_start = moment().add(1, 'weeks').endOf('isoWeek').subtract(2 ,'day').add(1, 'second');
        var range_end = moment().add(1, 'weeks').endOf('isoWeek');
        postData['start_date.range_start'] = range_start.format(CONSTANTS.POSTDATA_DATE_FORMAT);
        postData['start_date.range_end'] = range_end.format(CONSTANTS.POSTDATA_DATE_FORMAT);
      }

      $.ajax({
        url: CONSTANTS.API_ENDPOINT,
        type: 'GET',
        dataType: 'JSON',
        data: postData,
        success:function(response) {
          var data = {
            locationName: prediction,
            locationRadius: radius,
            popularEvents: popularEvents,
            nextWeekendEvents: nextWeekendEvents,
            locationData: response.events.map(function(evt){
              return {
                'id': evt.id ,
                'start': evt.start,
                'end': evt.end,
                'url': evt.url,
                'venue': evt.venue,
                'logo': evt.logo,
                'name': evt.name,
                'organizer': evt.organizer
              };
            })
          };
          storage.set({
            "eventbrite-aroundme": JSON.stringify(data)
          });
          self.setState({
            events: response.events,
            location: prediction,
            radius: radius,
            popularEvents: popularEvents,
            nextWeekendEvents: nextWeekendEvents
          });

          self.hideLoading();
        }
      });
    }});
    Object.defineProperty(App.prototype,"componentDidMount",{writable:true,configurable:true,value:function(){"use strict";
      var self = this;

      this.searchInput =  this.refs.searchInput.getDOMNode();
      this.searchRadiusInput =  this.refs.searchRadiusInput.getDOMNode();
      this.popularEvents =  this.refs.popularEvents.getDOMNode();
      this.nextWeekendEvents =  this.refs.nextWeekendEvents.getDOMNode();

      this.service = new google.maps.places.AutocompleteService();
      $(this.searchInput).typeahead({
        highlight: true
      }, {
        displayKey: 'prediction',
        source: function(query, process) {
          self.service.getPlacePredictions({ input: query }, function(predictions, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
              process($.map(predictions, function(prediction) {
                return {prediction: prediction.description};
              }));
            }
          });
        }
      }).on('typeahead:selected', function(e, obj, dataset){
        self.showLoading();
        self.getData(obj.prediction,
                      self.searchRadiusInput.value,
                      self.popularEvents.checked,
                      self.nextWeekendEvents.checked);
      }).on('focus', function(){
        $('.location-marker').css('opacity', 1);
      }).on('focusout', function(){
        $('.location-marker').css('opacity', 0);
      });

      this.hideLoading();
    }});
    Object.defineProperty(App.prototype,"hideLoading",{writable:true,configurable:true,value:function() {"use strict";
      $(this.refs.eventsListContainer.getDOMNode()).removeClass('loading');
      $(this.refs.loader.getDOMNode()).hide();
    }});
    Object.defineProperty(App.prototype,"showLoading",{writable:true,configurable:true,value:function() {"use strict";
      $(this.refs.eventsListContainer.getDOMNode()).addClass('loading');
      $(this.refs.loader.getDOMNode()).show();
    }});
    Object.defineProperty(App.prototype,"searchRadiusChangeHandler",{writable:true,configurable:true,value:function(e) {"use strict";
      var searchValue = this.searchInput.value;
      if($.trim(searchValue) == '') return;
      this.showLoading();
      this.getData(searchValue,
                    e.target.value,
                    this.popularEvents.checked,
                    this.nextWeekendEvents.checked);
    }});
    Object.defineProperty(App.prototype,"optionsHandler",{writable:true,configurable:true,value:function(e) {"use strict";
      this.setState({
        popularEvents: this.popularEvents.checked,
        nextWeekendEvents: this.nextWeekendEvents.checked
      });

      var searchValue = this.searchInput.value;
      if($.trim(searchValue) == '') return;

      this.showLoading();
      if( $(e.target).attr('name') == 'popular-events'){
        this.getData(this.searchInput.value,
                      this.searchRadiusInput.value,
                      this.popularEvents.checked,
                      this.nextWeekendEvents.checked);
      }else{
        this.getData(this.searchInput.value,
                      this.searchRadiusInput.value,
                      this.popularEvents.checked,
                      this.nextWeekendEvents.checked);
      }
    }});
    Object.defineProperty(App.prototype,"render",{writable:true,configurable:true,value:function() {"use strict";
      var location = this.state.location;
      var radius = this.state.radius;
      var popularEvents = this.state.popularEvents;
      var nextWeekendEvents = this.state.nextWeekendEvents;
      return (React.createElement("div", null, 
        React.createElement("div", {id: "logo-container"}, 
          React.createElement("div", {id: "logo"})
        ), 
        React.createElement("div", {className: "loader", ref: "loader"}, 
          React.createElement("img", {src: "../img/icons/48x48.png"})
        ), 
        React.createElement("div", {className: "search-box"}, 
          React.createElement("div", {className: "block-header"}, 
            React.createElement("span", {className: "title"}, "Popular events within", 
              React.createElement("select", {className: "search-radius-input", ref: "searchRadiusInput", onChange: this.searchRadiusChangeHandler.bind(this), defaultValue: radius}, 
                React.createElement("option", {value: "10"}, "10"), 
                React.createElement("option", {value: "25"}, "25"), 
                React.createElement("option", {value: "50"}, "50")
              ), 
            "miles around ")
          ), 
          React.createElement("div", {className: "location-input"}, 
            React.createElement("span", {className: "location-marker"}), 
            React.createElement("input", {autoFocus: true, type: "text", ref: "searchInput", className: "search-input", placeholder: "Enter your location here", defaultValue: location})
          )
        ), 
        React.createElement("div", {className: "event-options"}, 
          React.createElement("label", null, 
            React.createElement("input", {type: "checkbox", 
                  value: "true", 
                  ref: "popularEvents", 
                  name: "popular-events", 
                  checked: (popularEvents == "") ? false: true, 
                  onChange: this.optionsHandler.bind(this)}, " Popular ")
          ), 
          React.createElement("label", null, 
            React.createElement("input", {type: "checkbox", 
                  value: "true", 
                  ref: "nextWeekendEvents", 
                  name: "next-weekend-events", 
                  checked: (nextWeekendEvents == "") ? false: true, 
                  onChange: this.optionsHandler.bind(this)}, " Next Weekend ")
          )
        ), 
        React.createElement("div", {className: "events-list-container", ref: "eventsListContainer"}, 
          React.createElement(EventsList, {events: this.state.events, 
                      locationName: this.state.location})
        )
      ));
    }});
  

  storage.get('eventbrite-aroundme', function(data){
    if( data['eventbrite-aroundme'] !== undefined ){
      var store = JSON.parse(data['eventbrite-aroundme']);
      locationName = store.locationName;
      locationData = store.locationData;
      locationRadius = store.locationRadius;
      popularEvents = store.popularEvents;
      nextWeekendEvents = store.nextWeekendEvents;
    }
    React.render(React.createElement(App, {locationName: locationName, 
                      locationData: locationData, 
                      locationRadius: locationRadius, 
                      popularEvents: popularEvents, 
                      nextWeekendEvents: nextWeekendEvents}), mountNode);
  });
})();