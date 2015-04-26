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
  };
  /*
  storage: to access chrome extension local storage
            local is preferred over sync because of storage limit
  mountNode: reference to main container for react to load the app
   */
  var storage = chrome.storage.local, localData = {},
      mountNode = document.getElementById('app');
  /*
  react animation
   */
  var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
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
    Object.defineProperty(EventsList.prototype,"handleClick",{writable:true,configurable:true,value:function(e) {"use strict";
      e.preventDefault();
      chrome.tabs.create({ url: $(e.currentTarget).attr('href') });
    }});
    Object.defineProperty(EventsList.prototype,"handleLikeClick",{writable:true,configurable:true,value:function(evt, e) {"use strict";
      this.props.onEventLike(evt);
      $(e.currentTarget).toggleClass('liked');
      e.stopPropagation();
    }});
    /**
     * Render in EventsList Component receives list of events and also the
     * location so that this component knows when to display empty
     * event items message
     * @return {[type]} [description]
     */
    Object.defineProperty(EventsList.prototype,"render",{writable:true,configurable:true,value:function() {"use strict";
      var events = this.props.showLiked ? this.props.likedEvents : this.props.events, sortedEvents;
      if(events.length == 0 && $.trim(this.props.location) != ''){
        return React.createElement("div", {className: "no-events-found"}, 
          React.createElement("span", null, "Whoops! No events found.")
        );
      }else{
        if(!this.props.showLiked){
          if(this.props.marathonEvents){
            events = events.sort(function(eventA, eventB){
              return (Math.floor((new Date(eventA.end.utc)).getTime()/1000))-(Math.floor((new Date(eventB.end.utc)).getTime()/1000));
            });
            sortedEvents = [events[0]];
            for(var i=1; i<events.length; i++){
              var nextEventStart = Math.floor((new Date(events[i].start.utc)).getTime()/1000);
              var currentEventEnd = Math.floor((new Date(events[sortedEvents.length-1].end.utc)).getTime()/1000);
              if(currentEventEnd > nextEventStart) sortedEvents.push(events[i]);
            }
          }else{
            sortedEvents = events;
          }
        }else{
          sortedEvents = events;
        }
        var events = sortedEvents.map(function(evt){
          var startDate = moment(evt.start.local).format(CONSTANTS.EVENT_DISPLAY_DATE_FORMAT); // converts the date to a beautiful format
          var endDate = moment(evt.end.local).format(CONSTANTS.EVENT_DISPLAY_DATE_FORMAT);
          var address = [];
          if(evt.venue.address.city) address.push(evt.venue.address.city);
          if(evt.venue.address.region) address.push(evt.venue.address.region);
          if(!evt.hasOwnProperty("logo_url")){ /* For old apps so that they don't throw errors */
            var imageStyle = {
              backgroundImage: 'url('+((evt.logo) ? evt.logo.url : '' )+')'
            };
          }else{
            var imageStyle = {
              backgroundImage: 'url('+((evt.logo_url) ? evt.logo_url : '' )+')'
            };
          }
          var isLiked = this.props.likedEvents.filter(function(ev){ return ev.id == evt.id; }).length ? 'liked' : '';
          return React.createElement("li", {key: evt.id, className: "event-container"}, 
            React.createElement("a", {href: evt.url, onClick: this.handleClick.bind(this)}, 
              React.createElement("div", {className: "event"}, 
                React.createElement("div", {className: "image", style: imageStyle, "data-adaptive-background": "1", "data-ab-css-background": "1"}), 
                React.createElement("div", {className: "body"}, 
                  React.createElement("span", {className: "title"}, evt.name.text), 
                  React.createElement("span", {className: "like " + isLiked, onClick: this.handleLikeClick.bind(this, evt)}), 
                  React.createElement("span", {className: "organizer"}, evt.organizer.name), 
                  React.createElement("span", {className: "date"}, startDate), 
                   (address.length > 0 ) ? (React.createElement("span", {className: "address"}, address.join(", "))) : ''
                )
              )
            )
          );
        }, this);
        return React.createElement("div", null, 
          React.createElement(ReactCSSTransitionGroup, {component: "ul", className: "events-list", transitionName: "events-list-transition"}, 
            events
          )
          /*<div className="show-more">
            Show more ...
          </div>*/
        );
      }
    }});
  

  /**
   * Header component
   * Contains header logo
   * Contains settings component
   */
  var ____Class1=React.Component;for(var ____Class1____Key in ____Class1){if(____Class1.hasOwnProperty(____Class1____Key)){Header[____Class1____Key]=____Class1[____Class1____Key];}}var ____SuperProtoOf____Class1=____Class1===null?null:____Class1.prototype;Header.prototype=Object.create(____SuperProtoOf____Class1);Header.prototype.constructor=Header;Header.__superConstructor__=____Class1;function Header(){"use strict";if(____Class1!==null){____Class1.apply(this,arguments);}}
    Object.defineProperty(Header.prototype,"componentDidMount",{writable:true,configurable:true,value:function() {"use strict";
      this.$settingsDropdown = $(React.findDOMNode(this.refs.settingsDropdown));
    }});
    Object.defineProperty(Header.prototype,"settingsClickHandler",{writable:true,configurable:true,value:function() {"use strict";
      this.$settingsDropdown.toggle();
    }});
    Object.defineProperty(Header.prototype,"showLikedEventsClickHandler",{writable:true,configurable:true,value:function() {"use strict";
      this.$settingsDropdown.hide();
      this.props.onShowLikedEvents();
    }});
    Object.defineProperty(Header.prototype,"clearStorageClickHandler",{writable:true,configurable:true,value:function() {"use strict";
      this.$settingsDropdown.hide();
      this.props.onClearStorageEvent();
    }});
    Object.defineProperty(Header.prototype,"render",{writable:true,configurable:true,value:function() {"use strict";
      return (React.createElement("div", {id: "logo-container"}, 
        React.createElement("div", {id: "logo"}), 
        React.createElement("div", {id: "settings"}, 
          React.createElement("i", {className: "icon", onClick: this.settingsClickHandler.bind(this)}), 
          React.createElement("div", {className: "settings-dropdown", ref: "settingsDropdown"}, 
            React.createElement("ul", null, 
              React.createElement("li", {onClick: this.showLikedEventsClickHandler.bind(this)}, "Show liked"), 
              React.createElement("li", {onClick: this.clearStorageClickHandler.bind(this)}, "Clear storage")
            )
          )
        )
      ));
    }});
  

  /**
   * App: Main application which contains the title, search bar, options and the results
   */

  var ____Class2=React.Component;for(var ____Class2____Key in ____Class2){if(____Class2.hasOwnProperty(____Class2____Key)){App[____Class2____Key]=____Class2[____Class2____Key];}}var ____SuperProtoOf____Class2=____Class2===null?null:____Class2.prototype;App.prototype=Object.create(____SuperProtoOf____Class2);App.prototype.constructor=App;App.__superConstructor__=____Class2;
    function App(props) {"use strict";
      ____Class2.call(this,props);
      this.state = {
        events: props.events || [],
        location: props.location,
        radius: props.radius,
        popularEvents: props.popularEvents || false,
        nextWeekendEvents: props.nextWeekendEvents || false,
        marathonEvents: props.marathonEvents || false,
        likedEvents: props.likedEvents || [],
        showLiked: false
      };
    }
    Object.defineProperty(App.prototype,"getData",{writable:true,configurable:true,value:function(prediction, radius, popularEvents, nextWeekendEvents, marathonEvents){"use strict";
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
            location: prediction,
            locationRadius: radius,
            popularEvents: popularEvents,
            nextWeekendEvents: nextWeekendEvents,
            marathonEvents: marathonEvents,
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
          storage.clear();
          self.setState({
            events: response.events,
            location: prediction,
            radius: radius,
            popularEvents: popularEvents,
            nextWeekendEvents: nextWeekendEvents,
            marathonEvents: marathonEvents
          });
          self.hideLoading();
        }
      });
    }});
    Object.defineProperty(App.prototype,"shouldComponentUpdate",{writable:true,configurable:true,value:function(nextProps, nextState) {"use strict";
      var silent = nextState.hasOwnProperty('silent');
      if(silent) delete nextState['silent'];
      return nextState.hasOwnProperty('silent') ? !nextState.silent : true;
    }});
    Object.defineProperty(App.prototype,"componentDidMount",{writable:true,configurable:true,value:function() {"use strict";
      var self = this;

      this.searchInput =  this.refs.searchInput.getDOMNode();
      this.searchRadiusInput =  this.refs.searchRadiusInput.getDOMNode();
      this.popularEvents =  this.refs.popularEvents.getDOMNode();
      this.nextWeekendEvents =  this.refs.nextWeekendEvents.getDOMNode();
      this.marathonEvents =  this.refs.marathonEvents.getDOMNode();

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
                      self.nextWeekendEvents.checked,
                      self.marathonEvents.checked);
      }).on('focus', function(){
        $('.location-marker').css('opacity', 1);
      }).on('focusout', function(){
        $('.location-marker').css('opacity', 0);
      });

      this.hideLoading();

      $('body').on('click', function(e){
        if(!$(e.target).hasClass('settings-dropdown')){
          $('.settings-dropdown').hide();
        }
      });
    }});
    Object.defineProperty(App.prototype,"showLikedEventsClickHandler",{writable:true,configurable:true,value:function() {"use strict";
      this.setState({
        showLiked: true
      });
    }});
    Object.defineProperty(App.prototype,"showAllEvents",{writable:true,configurable:true,value:function() {"use strict";
      this.setState({
        showLiked: false
      });
    }});
    Object.defineProperty(App.prototype,"clearStorageEventClickHandler",{writable:true,configurable:true,value:function() {"use strict";
      storage.set({
        "eventbritearoundme": ""
      });
      this.setState({
        events: [],
        location: null,
        radius: null,
        popularEvents: false,
        nextWeekendEvents: false,
        marathonEvents: false,
        likedEvents: [],
        showLiked: false
      });
      $(React.findDOMNode(this.refs.searchInput)).typeahead('val', '');
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
                    this.nextWeekendEvents.checked,
                    this.marathonEvents.checked);
    }});
    Object.defineProperty(App.prototype,"eventLikeHandler",{writable:true,configurable:true,value:function(evt) {"use strict";
      var likedEvts = this.state.likedEvents,
          self = this;
      var currEvt = likedEvts.filter(function(item) { return item.id == evt.id});
      if(currEvt.length)
        likedEvts.splice(likedEvts.indexOf(currEvt[0]),1);
      else
        likedEvts.push(evt);

      this.setState({
        likedEvents: likedEvts,
        silent: true
      }, function() {
        storage.set({
          "eventbritearoundme": JSON.stringify(self.state)
        });
      });
    }});
    Object.defineProperty(App.prototype,"optionsHandler",{writable:true,configurable:true,value:function(e) {"use strict";
      this.setState({
        popularEvents: this.popularEvents.checked,
        nextWeekendEvents: this.nextWeekendEvents.checked,
        marathonEvents: this.marathonEvents.checked
      });

      var searchValue = this.searchInput.value;
      if($.trim(searchValue) == '') return;

      this.showLoading();
      var name = $(e.target).attr('name');
      if( name == 'popular-events'){
        this.getData(this.searchInput.value,
                      this.searchRadiusInput.value,
                      this.popularEvents.checked,
                      this.nextWeekendEvents.checked,
                      this.marathonEvents.checked);
      }else if( name == 'next-weekend-events'){
        this.getData(this.searchInput.value,
                      this.searchRadiusInput.value,
                      this.popularEvents.checked,
                      this.nextWeekendEvents.checked,
                      this.marathonEvents.checked);
      }else{
        this.getData(this.searchInput.value,
                      this.searchRadiusInput.value,
                      this.popularEvents.checked,
                      this.nextWeekendEvents.checked,
                      this.marathonEvents.checked);
      }
    }});
    Object.defineProperty(App.prototype,"eventOptionsStyle",{writable:true,configurable:true,value:function(rev) {"use strict";
      var showLiked = this.state.showLiked;
      if(rev == "!")
        showLiked = !showLiked;
      return { display: (showLiked ? 'none':'') }
    }});
    Object.defineProperty(App.prototype,"render",{writable:true,configurable:true,value:function() {"use strict";
      var location = this.state.location;
      var radius = this.state.radius;
      var popularEvents = this.state.popularEvents;
      var nextWeekendEvents = this.state.nextWeekendEvents;
      var marathonEvents = this.state.marathonEvents;
      return (React.createElement("div", null, 
        React.createElement(Header, {onShowLikedEvents: this.showLikedEventsClickHandler.bind(this), 
                onClearStorageEvent: this.clearStorageEventClickHandler.bind(this)}), 
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
        React.createElement("div", {className: "event-options", style: this.eventOptionsStyle()}, 
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
          ), 
          React.createElement("label", null, 
            React.createElement("input", {type: "checkbox", 
                  value: "true", 
                  ref: "marathonEvents", 
                  name: "marathon-events", 
                  checked: (marathonEvents == "") ? false: true, 
                  onChange: this.optionsHandler.bind(this)}, " Marathon ")
          )
        ), 
        React.createElement("div", {className: "event-options", style: this.eventOptionsStyle('!')}, 
            React.createElement("a", {href: "#", onClick: this.showAllEvents.bind(this)}, " Show all events ")
        ), 
        React.createElement("div", {className: "events-list-container", ref: "eventsListContainer"}, 
          React.createElement(EventsList, React.__spread({},  this.state, {onEventLike: this.eventLikeHandler.bind(this)}))
        )
      ));
    }});
  

  storage.get('eventbritearoundme', function(data){
    if( data['eventbritearoundme'] !== undefined ){
      localData = (data['eventbritearoundme'] != "") ? JSON.parse(data['eventbritearoundme']) : {};
    }
    React.render(React.createElement(App, React.__spread({},  localData)), mountNode);
  });
})();