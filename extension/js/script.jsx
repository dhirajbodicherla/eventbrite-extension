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
  class EventsList extends React.Component{
    /**
     * Click handler for each event list item
     * Opens a chrome tab on click
     * @param  {clickevent} e
     * @return
     */
    handleClick(e) {
      e.preventDefault();
      chrome.tabs.create({ url: $(e.currentTarget).attr('href') });
    }
    handleLikeClick(evt, e) {
      this.props.onEventLike(evt);
      $(e.currentTarget).toggleClass('liked');
      e.stopPropagation();
    }
    /**
     * Render in EventsList Component receives list of events and also the
     * location so that this component knows when to display empty
     * event items message
     * @return {[type]} [description]
     */
    render() {
      var events = this.props.showLiked ? this.props.likedEvents : this.props.events, sortedEvents;
      if(events.length == 0 && $.trim(this.props.location) != ''){
        return <div className="no-events-found">
          <span>Whoops! No events found.</span>
        </div>;
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
          var eventName = evt.name.text;
          // var evtOrganizerName = evt.organizer.name; // because of change in API
          var evtOrganizerName = '';
          // if(evt.venue.address.city) address.push(evt.venue.address.city);
          // if(evt.venue.address.region) address.push(evt.venue.address.region);
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
          return <li key={evt.id} className="event-container">
            <a href={evt.url} onClick={this.handleClick.bind(this)}>
              <div className="event">
                <div className="image" style={imageStyle} data-adaptive-background='1' data-ab-css-background='1'></div>
                <div className="body">
                  <span className="title">{eventName}</span>
                  <span className={"like " + isLiked} onClick={this.handleLikeClick.bind(this, evt)}></span>
                  <span className="organizer">{evtOrganizerName}</span>
                  <span className="date">{startDate}</span>
                  { (address.length > 0 ) ? (<span className="address">{address.join(", ")}</span>) : '' }
                </div>
              </div>
            </a>
          </li>;
        }, this);
        return <div>
          <ReactCSSTransitionGroup component="ul" className="events-list" transitionName="events-list-transition">
            {events}
          </ReactCSSTransitionGroup>
          {/*<div className="show-more">
            Show more ...
          </div>*/}
        </div>;
      }
    }
  }

  /**
   * Header component
   * Contains header logo
   * Contains settings component
   */
  class Header extends React.Component{
    componentDidMount() {
      this.$settingsDropdown = $(React.findDOMNode(this.refs.settingsDropdown));
    }
    settingsClickHandler() {
      this.$settingsDropdown.toggle();
    }
    showLikedEventsClickHandler() {
      this.$settingsDropdown.hide();
      this.props.onShowLikedEvents();
    }
    clearStorageClickHandler() {
      this.$settingsDropdown.hide();
      this.props.onClearStorageEvent();
    }
    render() {
      return (<div id="logo-container">
        <div id="logo"></div>
        <div id="settings">
          <i className="icon" onClick={this.settingsClickHandler.bind(this)}></i>
          <div className="settings-dropdown" ref="settingsDropdown">
            <ul>
              <li onClick={this.showLikedEventsClickHandler.bind(this)}>Show liked</li>
              <li onClick={this.clearStorageClickHandler.bind(this)}>Clear storage</li>
            </ul>
          </div>
        </div>
      </div>);
    }
  }

  /**
   * App: Main application which contains the title, search bar, options and the results
   */

  class App extends React.Component {
    constructor(props) {
      super(props);
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
    getData(prediction, radius, popularEvents, nextWeekendEvents, marathonEvents){
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
    }
    shouldComponentUpdate(nextProps, nextState) {
      var silent = nextState.hasOwnProperty('silent');
      if(silent) delete nextState['silent'];
      return nextState.hasOwnProperty('silent') ? !nextState.silent : true;
    }
    componentDidMount() {
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
    }
    showLikedEventsClickHandler() {
      this.setState({
        showLiked: true
      });
    }
    showAllEvents() {
      this.setState({
        showLiked: false
      });
    }
    clearStorageEventClickHandler() {
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
    }
    hideLoading() {
      $(this.refs.eventsListContainer.getDOMNode()).removeClass('loading');
      $(this.refs.loader.getDOMNode()).hide();
    }
    showLoading() {
      $(this.refs.eventsListContainer.getDOMNode()).addClass('loading');
      $(this.refs.loader.getDOMNode()).show();
    }
    searchRadiusChangeHandler(e) {
      var searchValue = this.searchInput.value;
      if($.trim(searchValue) == '') return;
      this.showLoading();
      this.getData(searchValue,
                    e.target.value,
                    this.popularEvents.checked,
                    this.nextWeekendEvents.checked,
                    this.marathonEvents.checked);
    }
    eventLikeHandler(evt) {
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
    }
    optionsHandler(e) {
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
    }
    eventOptionsStyle(rev) {
      var showLiked = this.state.showLiked;
      if(rev == "!")
        showLiked = !showLiked;
      return { display: (showLiked ? 'none':'') }
    }
    render() {
      var location = this.state.location;
      var radius = this.state.radius;
      var popularEvents = this.state.popularEvents;
      var nextWeekendEvents = this.state.nextWeekendEvents;
      var marathonEvents = this.state.marathonEvents;
      return (<div>
        <Header onShowLikedEvents={this.showLikedEventsClickHandler.bind(this)}
                onClearStorageEvent={this.clearStorageEventClickHandler.bind(this)}/>
        <div className="loader" ref="loader">
          <img src="../img/icons/48x48.png"></img>
        </div>
        <div className="search-box">
          <div className="block-header">
            <span className="title">Popular events within
              <select className="search-radius-input" ref="searchRadiusInput" onChange={this.searchRadiusChangeHandler.bind(this)} defaultValue={radius}>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            miles around </span>
          </div>
          <div className="location-input">
            <span className="location-marker"></span>
            <input autoFocus type="text" ref="searchInput" className="search-input" placeholder="Enter your location here" defaultValue={location} />
          </div>
        </div>
        <div className="event-options" style={this.eventOptionsStyle()}>
          <label>
            <input type="checkbox"
                  value="true"
                  ref="popularEvents"
                  name="popular-events"
                  checked={(popularEvents == "") ? false: true}
                  onChange={this.optionsHandler.bind(this)}> Popular </input>
          </label>
          <label>
            <input type="checkbox"
                  value="true"
                  ref="nextWeekendEvents"
                  name="next-weekend-events"
                  checked={(nextWeekendEvents == "") ? false: true}
                  onChange={this.optionsHandler.bind(this)}> Next Weekend </input>
          </label>
          <label>
            <input type="checkbox"
                  value="true"
                  ref="marathonEvents"
                  name="marathon-events"
                  checked={(marathonEvents == "") ? false: true}
                  onChange={this.optionsHandler.bind(this)}> Marathon </input>
          </label>
        </div>
        <div className="event-options" style={this.eventOptionsStyle('!')}>
            <a href="#" onClick={this.showAllEvents.bind(this)}> Show all events </a>
        </div>
        <div className="events-list-container" ref="eventsListContainer">
          <EventsList {...this.state} onEventLike={this.eventLikeHandler.bind(this)}/>
        </div>
      </div>);
    }
  }

  storage.get('eventbritearoundme', function(data){
    if( data['eventbritearoundme'] !== undefined ){
      localData = (data['eventbritearoundme'] != "") ? JSON.parse(data['eventbritearoundme']) : {};
    }
    React.render(<App {...localData} />, mountNode);
  });
})();