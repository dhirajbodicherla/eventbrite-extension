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
  class EventsList extends React.Component{
    /**
     * Click handler for each event list item
     * Opens a chrome tab on click
     * @param  {clickevent} e
     * @return
     */
    handleClick(e){
      e.preventDefault();
      chrome.tabs.create({ url: $(e.currentTarget).attr('href') });
    }
    /**
     * Render in EventsList Component receives list of events and also the
     * locationName so that this component knows when to display empty
     * event items message
     * @return {[type]} [description]
     */
    render() {
      if(this.props.events.length == 0 && $.trim(this.props.locationName) != ''){
        return <div className="no-events-found">
          <span>Whoops! No events found.</span>
        </div>;
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
          return <li key={event.id} className="event-container">
            <a href={event.url} onClick={this.handleClick}>
              <div className="event">
                <div className="image" style={imageStyle} data-adaptive-background='1' data-ab-css-background='1'></div>
                <div className="body">
                  <span className="title">{event.name.text}</span>
                  <span className="organizer">{event.organizer.name}</span>
                  <span className="date">{startDate}</span>
                  { (address.length > 0 ) ? (<span className="address">{address.join(", ")}</span>) : '' }
                </div>
              </div>
            </a>
          </li>;
        }, this);
        return <div>
          <ul className="events-list">
            {events}
          </ul>
          {/*<div className="show-more">
            Show more ...
          </div>*/}
        </div>;
      }
    }
  }

  /**
   * App: Main application which contains the title, search bar, options and the results
   */

  class App extends React.Component {
    constructor(props){
      super(props);
      this.state = {
        events: props.locationData,
        location: props.locationName,
        radius: props.locationRadius,
        popularEvents: props.popularEvents,
        nextWeekendEvents: props.nextWeekendEvents
      };
    }
    getData(prediction, radius, popularEvents, nextWeekendEvents){
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
    }
    componentDidMount(){
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
                    this.nextWeekendEvents.checked);
    }
    optionsHandler(e) {
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
    }
    render() {
      var location = this.state.location;
      var radius = this.state.radius;
      var popularEvents = this.state.popularEvents;
      var nextWeekendEvents = this.state.nextWeekendEvents;
      return (<div>
        <div id="logo-container">
          <div id="logo"></div>
        </div>
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
            <input autoFocus type="text" ref="searchInput" className="search-input" placeholder="Enter your location here" defaultValue={location}/>
          </div>
        </div>
        <div className="event-options">
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
        </div>
        <div className="events-list-container" ref="eventsListContainer">
          <EventsList events={this.state.events}
                      locationName={this.state.location}/>
        </div>
      </div>);
    }
  }

  storage.get('eventbrite-aroundme', function(data){
    if( data['eventbrite-aroundme'] !== undefined ){
      var store = JSON.parse(data['eventbrite-aroundme']);
      locationName = store.locationName;
      locationData = store.locationData;
      locationRadius = store.locationRadius;
      popularEvents = store.popularEvents;
      nextWeekendEvents = store.nextWeekendEvents;
    }
    React.render(<App locationName={locationName}
                      locationData={locationData}
                      locationRadius={locationRadius}
                      popularEvents={popularEvents}
                      nextWeekendEvents={nextWeekendEvents}/>, mountNode);
  });
})();