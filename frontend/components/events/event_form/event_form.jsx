import React, { Component } from 'react';
import MessagedInput from '../../helper_components/messagedInput';
import StyledInput from '../../helper_components/styled_input';
import { TagButton, TagButtons }from '../../helper_components/tag_button';
import SubmitBar from '../../helper_components/submit_bar';
import { toMinutes, toTime } from '../../../util/calculations';
import { withRouter } from 'react-router-dom'; 
import PriceInput from './price_input';

class EventForm extends Component {
    constructor(props) {
        super(props)

        // if params contains an eventId wildcard, then the formtype must be for updating
        let formType = this.props.match.params.eventId ? "Update" : "Create";
        this.state = {
            formType: formType,
            eventId: this.props.eventId,
            title: '',
            eventType: '',
            category: '',
            tag: '',
            tags: [],
            organizer: '',
            onlineEvent: false,
            street: '',
            city: '',
            state: '',
            zipCode: '',
            beginDay: '',
            beginMonth: '',
            beginYear: '',
            endDay: '',
            endMonth: '',
            endYear: '',
            beginTime: '',
            endTime: '',
            venueName: '',
            price: '',
            lat: '',
            lng: '',
            extraAddressInfo: false
        }
        this.renderAddressInputs = this.renderAddressInputs.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleDiscard = this.handleDiscard.bind(this);
        this.enableGooglePlaces = this.enableGooglePlaces.bind(this);
    }

    // receive action object from fetchEvent thunk action creator, extracting event from action and setting state for prefilling form inputs 
    componentDidMount() {
        window.scrollTo(0, 0);

        // google address autocomplete search bar
        this.enableGooglePlaces();

        if (this.props.location.state) this.populateDate();
            
        // if formtype is update, then fetch relevant event and set state for event information 
        if (this.state.formType !== "Update") return;
        this.props.fetchEvent(this.props.match.params.eventId).then(
            (action) => {
                const { event: { title, eventType, category, organizer, onlineEvent, street, state, city, zipCode, beginDay, beginMonth, beginYear, endDay, endMonth, endYear, beginTime, endTime, description, id, price, venueName, lat, lng } } = action;
                let currentTags = action.tags ? Object.values(action.tags).map(tag => tag.tagName) : [];
                // let addressInput = document.querySelector('#autocomplete');
                // addressInput.value = `${venueName}, ${street}, ${city}, ${state}, USA`;
                this.setState({ title, eventType, category, tags: currentTags, organizer, onlineEvent, street, state, city, zipCode, beginDay, beginMonth, beginYear, endDay, endMonth, endYear, beginTime, endTime, description, eventId: id, price, venueName, lat, lng });
            }
        );
    }

    componentDidUpdate(prevProps) {
        if (this.props.match.params !== prevProps.match.params && this.state.formType == "Update") {
            this.props.fetchEvent(this.props.match.params.eventId).then(
                (action) => {
                    const { event: { title, eventType, category, organizer, onlineEvent, street, state, city, zipCode, beginDay, beginMonth, beginYear, endDay, endMonth, endYear, beginTime, endTime, description, id, price, venueName } } = action;
                    let currentTags = action.tags ? Object.values(action.tags).map(tag => tag.tagName) : [];
                    this.setState({ title, eventType, category, tags: currentTags, organizer, onlineEvent, street, state, city, zipCode, beginDay, beginMonth, beginYear, endDay, endMonth, endYear, beginTime, endTime, description, eventId: id, price, venueName });
                }
            );
        }
    }

    populateDate() {
        let { category, day } = this.props.location.state;
        if (category) document.querySelectorAll('select')[1].value = category;
        if (day) {
            let today = new Date();
            let tomorrow = new Date();
            tomorrow.setDate(today.getDate() + 1);
            let selectedDay = day === 'Tomorrow' ? tomorrow : today;
            let year = '20' + selectedDay.getYear().toString().slice(1);
            let month = selectedDay.getMonth().toString();
            let date = selectedDay.getDate().toString();
            month = month.length === 1 ? `0${month}` : month;
            date = date.length === 1 ? `0${date}` : date;
            document.querySelectorAll('input')[6].value = `${year}-${month}-${date}`;
        }
    }

    enableGooglePlaces() {
        let input = document.getElementById('autocomplete');
        // default boundaries within NYC
        let defaultBounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(40.705722, -74.022880),
            new google.maps.LatLng(40.801793, -73.928715)
        );
        let options = {
            bounds: defaultBounds,
            types: ['establishment']
        };

        if (this.state.formType === "Create") {
            let autocomplete = new google.maps.places.Autocomplete(input, options);

            this.autocompletelistener = google.maps.event.addListener(autocomplete, 'place_changed', () => {
                let venueJSON = autocomplete.getPlace();
                let addressArray = venueJSON.formatted_address.split(",").map(string => string.trim());
                let lat = venueJSON.geometry.location.lat();
                let lng = venueJSON.geometry.location.lng();
                let venueName = venueJSON.name;
                if (addressArray.length === 3) {
                    let city = addressArray[0];
                    let state, zipCode;
                    if (addressArray[1].split(" ").length === 2) {
                        state = addressArray[1].split(" ")[0];
                        zipCode = addressArray[1].split(" ")[1];
                        this.setState({ zipCode });
                    } else {
                        state = addressArray[1];
                    }
                    this.setState({ venueName, city, state, extraAddressInfo: true });
                } else {
                    let [street, city] = [addressArray[0], addressArray[1]];
                    let [state, zipCode] = addressArray[2].split(" ");
                    this.setState({ street, city, state, zipCode, venueName, lat, lng });
                }
            });
        }
    }

    disableGooglePlaces() {
        let input = document.querySelector('.url-input');
        google.maps.event.clearInstanceListeners(input);
    }

    handleChange(type, payload) {
        return ({ target }) => {
            event.preventDefault();
            switch (type) {
                case 'text':
                    this.setState({ [payload]: target.value });
                    break;
                case 'select':
                    this.setState({ [payload]: target.value });
                    break;
                case 'venueSelect':
                    let boolValue = target.value === 'Online' ? true : false;
                    boolValue ? window.setTimeout(this.disableGooglePlaces, 0) : window.setTimeout(this.enableGooglePlaces, 0)
                    this.setState({ onlineEvent: boolValue });
                    break;
                case 'date':
                    let dateArr = target.value.split('-');
                    this.setState({ [`${payload}Year`]: dateArr[0], [`${payload}Month`]: dateArr[1], [`${payload}Day`]: dateArr[2]});
                    break;
                case 'time':
                    let time = toMinutes(target.value);
                    this.setState({[`${payload}Time`]: time});
                    break;
                case 'deleteTag': 
                    let tags = this.state.tags.filter(tag => tag !== payload);
                    this.setState({ tags });
                    break;
            }
        }
    }

    handleSubmit(type) {
        return (event) => {
            event.preventDefault();
            switch (type) {
                case "formSubmit":
                    // post or update event depending on the formType
                    let action = this.state.formType === "Update" ? this.props.updateEvent : this.props.postEvent;
                    const { title, eventType, category, tags, organizer, onlineEvent, street, state, city, zipCode, beginDay, beginMonth, beginYear, endDay, endMonth, endYear, beginTime, endTime, venueName, price, lat, lng } = this.state;
                    let requestParams = { title, event_type: eventType, category, tags, organizer, online_event: onlineEvent, venue_name: venueName, street, state, city, zip_code: zipCode, begin_day: beginDay, begin_month: beginMonth, begin_year: beginYear, end_day: endDay, end_month: endMonth, end_year: endYear, begin_time: beginTime, end_time: endTime, user_id: this.props.currentUser, id: this.state.eventId, price, lat, lng }
                    action(requestParams).then(
                        (action) => {
                            const { event } = action
                            this.props.history.push(`/dashboard/details/${event.id}`)
                        }
                    );
                    break;
                case "tagSubmit":
                    if (!this.state.tag.length) break;
                    let newTags = this.state.tags.slice();
                    newTags.push(this.state.tag);
                    this.setState({ tags: newTags, tag: '' });
                    break;
            }
        }
    }

    handleDiscard() {
        let formType = this.props.match.params.eventId ? "Update" : "Create";
        this.setState({
            formType: formType,
            eventId: this.props.eventId,
            title: '',
            eventType: '',
            category: '',
            tag: '',
            tags: [],
            organizer: '',
            onlineEvent: false,
            street: '',
            city: '',
            state: '',
            zipCode: '',
            beginDay: '',
            beginMonth: '',
            beginYear: '',
            endDay: '',
            endMonth: '',
            endYear: '',
            beginTime: '',
            endTime: '',
            venueName: '',
            price: ''
        });
    }

    // ensures no leading/trailing whitespace
    handleAddress(address) {
        let [street, city, state, zipCode] = address.split(',');
        [street, city, state, zipCode] = [street.trim(), city.trim(), state.trim(), zipCode.trim()];
        return [street, city, state, zipCode];
    }

    // conditionally render address inputs
    renderAddressInputs() {
        let addressInput = this.state.formType === "Update" || this.state.extraAddressInfo === true ? (
            <>
                <MessagedInput caption="Address" placeholder="e.g. 155 5th Street" value={this.state.street} onChange={this.handleChange("text", "street")} />
                <div className="city-state-zip">
                    <MessagedInput caption="City" placeholder="e.g. New York" value={this.state.city} onChange={this.handleChange("text", "city")} />
                    <MessagedInput caption="State" placeholder="e.g. NY" value={this.state.state} onChange={this.handleChange("text", "state")} />
                    <MessagedInput caption="Zip Code" placeholder="e.g. 11101" value={this.state.zipCode} onChange={this.handleChange("text", "zipCode")} /> 
                </div>
            </>
        ) : (
            <input type="text" placeholder="Search for a venue or address" id="autocomplete"/>
        );

        return this.state.onlineEvent ? (
            <div className="address-inputs">
                <input className="url-input" placeholder="URL" onChange={this.handleChange("text", "venueName")} />
            </div>
        ) : (
            <div className="address-inputs">
                {addressInput}
            </div>
        );
    }

    renderOnlineOrVenue() {
        return this.state.onlineEvent ? (
            <select onChange={this.handleChange("venueSelect")} defaultValue='Online'>
                <option key={`venue-1`}>Venue</option>
                <option key={`venue-2`}>Online</option>
            </select>
        ) : (
            <div className="flex">
                <select onChange={this.handleChange("venueSelect")} defaultValue='Venue'>
                    <option key={`venue-1`}>Venue</option>
                    <option key={`venue-2`}>Online</option>
                </select>
                <input type="text" id="venueNameInput" placeholder="Venue Name" value={this.state.venueName} onChange={this.handleChange("text", "venueName")} />
            </div>
        );
    }

    render() {
        const TYPES = [
            'Type',
            'Appearance or Signing', 
            'Attraction, Camp, Trip, or Retreat', 
            'Class, Training, or Workshop',
            'Concert or Performance',
            'Conference',
            'Convention',
            'Dinner or Gala',
            'Festival or Fair',
            'Game or Competition',
            'Meeting or Networking Event',
            'Party or Social Gathering',
            'Race or Endurance Event',
            'Rally',
            'Screening',
            'Seminar or Talk'
        ]
        const CATEGORIES = [
            'Category',
            'Business & Professional', 
            'Community & Culture', 
            'Family & Education',
            'Film & Media',
            'Food & Drink',
            'Health',
            'Hobbies',
            'Home & Lifestyle',
            'Music',
            'Performing and Visual Arts',
            'Science & Tech'
        ]

        const TIMES = [
            "12", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"
        ]

        let types = TYPES.map((type, idx) => (
            <option key={idx}>{type}</option>
        ));

        let categories = CATEGORIES.map((category, idx) => (
            <option key={`category-${idx}`}>{category}</option>
        ));

        // generate TagButton components for TagButtons component
        let tags = this.state.tags.map((tag, idx) => (
            <TagButton 
                key={`tag-${idx}`} 
                onClick={this.handleChange("deleteTag", `${tag}`)} 
                tag={tag} 
                color={"black"}
            />
        ));

        // create option tags with all possible times
        let times = TIMES.map((time, idx) => (
            <React.Fragment key={`fragment-${idx}`}>
                <option key={`option-${idx}-0`}>{`${time}:00 AM`}</option>
                <option key={`option-${idx}-1`}>{`${time}:30 AM`}</option>
            </React.Fragment>
        )).concat(TIMES.map((time, idx) => (
            <React.Fragment key={`fragment-2-${idx}`}>
                <option key={`option-${idx}-2`}>{`${time}:00 PM`}</option>
                <option key={`option-${idx}-3`}>{`${time}:30 PM`}</option>
            </React.Fragment>
        )));
        
        let submitBarShow = this.state.title.length ? 'submit-bar-show' : '';

        return(
            <>
            <SubmitBar 
                onSubmitClick={this.handleSubmit("formSubmit")} 
                onDiscardClick={this.handleDiscard}
                submitBarShow={submitBarShow}
            />
            <div className="event-container">
                <div className="event-form">
                    <div className="section-head flex">
                        <img className="icon" src={window.textIcon} />
                        <h1>Basic Info</h1>
                    </div>
                    <p>Name your event and tell event-goers why they should come. Add details that highlight what makes it unique.</p>
                    <MessagedInput
                        caption="Event Title" 
                        placeholder="Be clear and descriptive." 
                        value={this.state.title} 
                        onChange={this.handleChange("text", "title")}
                    />
                    <span>
                        {this.state.title.length}/75
                    </span>
                    <div className="flex">
                        <select onChange={this.handleChange("select", "eventType")}>
                            {types}
                        </select>
                        <select onChange={this.handleChange("select", "category")}>
                            {categories}
                        </select>
                    </div> 
                    <div className="flex">
                        <MessagedInput
                            onChange={this.handleChange("text", "tag")}
                            value={this.state.tag}
                            placeholder="Add keywords to your event"
                            caption="Enter Tag" 
                        />        
                        <div className="button-1" onClick={this.handleSubmit("tagSubmit")}>Add</div>                       
                    </div>    
                    <div className="tag-counts flex">
                        <div className="tag-span-item">{`${this.state.tags.length}/10 tags.`}</div>
                        <div className="tag-span-item">{`${this.state.tag.length}/75`}</div>
                    </div>
                    <TagButtons>
                        {tags}
                    </TagButtons>
                    <MessagedInput 
                        onChange={this.handleChange("text", "organizer")} 
                        value={this.state.organizer} 
                        placeholder="Tell attendees who is organizing this event." 
                        caption="Organizer"
                    />
                    <span>
                        {this.state.organizer.length}/75
                    </span>
                    {/* <input type="text" id="venueNameInput" placeholder="$ Price per ticket" value={this.state.price} onChange={this.handleChange("text", "price")} /> */}
                    <PriceInput value={this.state.price} onChange={this.handleChange("text", "price")}/>

                </div>
                <hr />
                <div className="event-form">
                    <div className="section-head flex">
                        <img className="icon" src={window.mapIcon} />
                        <h1>Location</h1>
                    </div>   
                    <p>Help people in the area discover your event and let attendees know where to show up.</p>
                    {this.renderOnlineOrVenue()}
                    {this.renderAddressInputs()}
                </div>
                <hr />
                <div className="event-form">
                    <div className="section-head flex">
                        <img className="icon" src={window.calendarIcon} />
                        <h1>Date and Time</h1>
                    </div>   
                    <p>Tell event-goers when your event starts and ends so they can make plans to attend.</p>
                    <div className="date-time">
                        <span>
                            <input 
                                type="date" 
                                onChange={this.handleChange("date", "begin")} 
                            />
                            <select value={toTime(this.state.beginTime)} onChange={this.handleChange("time", "begin")}>
                                {times}
                            </select>
                        </span>
                        <span>
                            <input 
                                type="date" 
                                onChange={this.handleChange("date", "end")} 
                            />
                            <select value={toTime(this.state.endTime)} onChange={this.handleChange("time", "end")}>
                                {times}
                            </select>
                        </span>
                    </div>
                </div>
            </div>
            <div className="spacer" />
            </>
        )
    }
}

export default withRouter(EventForm);