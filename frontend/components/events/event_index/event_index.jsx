import React, { Component } from 'react';
import IndexSearch from './index_search';
import IndexFilter from './index_filter';
import IndexRow from './index_row';
import FiltersAside from './index_filters_aside';
import { toTime, toMonth } from '../../../util/calculations';
import Map from '../../helper_components/google_map';
import MessageBar from '../../helper_components/message_bar';

class EventIndex extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showFiltersAside: false,
            categoryFilter: '',
            eventTypeFilter: '',
            priceFilter: '',
            messageBar: false,
            liked: false,
            
            filterSelections: {
                categoryFilter: '',
                eventTypeFilter: '',
                priceFilter: '',
            }

        }

        this.events = [];

        this.handleFilterChange = this.handleFilterChange.bind(this); 
        this.handleApplyClick = this.handleApplyClick.bind(this);
    }

    componentDidMount() {
        this.props.fetchEvents();
        window.scrollTo(0, 0);
    }

    handleLikeClick(eventId) {
        return () => {
            debugger
            if (!this.props.currentUser) {
                this.props.history.push('/signin');
                return;
            }
            if (this.props.likes[eventId]) {
                this.setState({ messageBar: true, liked: false });
                this.props.deleteLike(eventId, this.props.likes[eventId].likeId, "index");
            } else {
                this.setState({ messageBar: true, liked: true });
                this.props.postLike(eventId, "index");
            }
            setTimeout(() => {
                this.setState({ messageBar: false });
            }, 4000);
        }
    }

    handleFiltersClick(bool) {
        return () => {
            this.setState({ showFiltersAside: bool });
        };
    }

    handleFilterChange(filter) {
        return (event) => {
            let value = event.target.value.split(' ')[0] === "Any" ? '' : event.target.value;
            let filterSelections = Object.assign(this.state.filterSelections);
            filterSelections[filter] = value;
            this.setState({ filterSelections });
        };
    }

    handleApplyClick() {
        let categoryFilter = this.state.filterSelections.categoryFilter;
        let eventTypeFilter = this.state.filterSelections.eventTypeFilter;
        let priceFilter = this.state.filterSelections.priceFilter;
        this.setState({ categoryFilter, eventTypeFilter, priceFilter });
    }

    handleEventClick(id) {
        return () => {
            this.props.history.push(`/events/${id}`);
        };
    }

    render() { 
        let { categoryFilter, eventTypeFilter, priceFilter } = this.state; 
        // if (categoryFilter || eventTypeFilter || priceFilter)
        let events = this.props.events.filter(event => {
            if (event.category === categoryFilter || !categoryFilter) {
                if (event.eventType === eventTypeFilter || !eventTypeFilter) {
                    if ((event.price > 0 && priceFilter === "Paid") || (event.price === 0 && priceFilter === "Free") || !priceFilter) {
                        return event;
                    }
                }
            }
        });

        this.events = events;

        let indexRows = events.map((event, idx) => {
            let { title, beginMonth, beginDay, beginTime, venueName, city, state, price, pictureUrl, id } = event;
            let liked = this.props.likes[id] ? true : false;
            return (
                <IndexRow
                    pictureUrl = {pictureUrl}
                    key={idx}
                    day={"Mon"}
                    title={title}
                    beginMonth={toMonth(beginMonth)}
                    beginDay={beginDay}
                    beginTime={toTime(beginTime)}
                    venueName={venueName}
                    city={city}
                    state={state}
                    price={price}
                    onLikeClick={this.handleLikeClick(id)}
                    onEventClick={this.handleEventClick(id)}
                    liked={liked}
                />
            );
        });

        let messageBarShow = this.state.messageBar ? 'message-bar-show' : '';

        return ( 
            <div className="event-index">
                <MessageBar messageBarShow={messageBarShow} onCloseClick={this.handleMessageBar} liked={this.state.liked} />
                <IndexSearch indexRows={indexRows}/>
                <IndexFilter 
                    onFiltersClick={this.handleFiltersClick(true)}
                    onCategoryClick={this.handleFilterChange('categoryFilter')}
                />
                <div className="index-rows-container">
                    {indexRows}
                </div>
                {/* <Map events={this.events} /> */}
                <FiltersAside
                    showAside={this.state.showFiltersAside}
                    onCloseClick={this.handleFiltersClick(false)}
                    onCategoryChange={this.handleFilterChange('categoryFilter')}
                    onTypeChange={this.handleFilterChange('eventTypeFilter')}
                    onPriceChange={this.handleFilterChange('priceFilter')}
                    onApplyClick={this.handleApplyClick}
                />
            </div> 
        );
    }
}
 
export default EventIndex;