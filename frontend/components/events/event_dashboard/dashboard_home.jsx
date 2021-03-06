import React, { Component } from 'react';
import DashboardRow from './dashboard_row';
import { toMonth, toTime } from '../../../util/calculations';
import { withRouter } from 'react-router-dom';

class Dashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchTerm: ''
        }
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount() {
        this.props.fetchCreatedEvents(this.props.currentUser);
        window.scrollTo(0, 0);
    }

    componentDidUpdate(prevProps) {
        if (this.props.location.pathname != prevProps.location.pathname) {
            this.props.fetchCreatedEvents(this.props.currentUser);
        }
    }

    onDeleteClick(id) {
        return () => {
            this.props.deleteEvent(id);
            document.querySelector('.popup-menu').remove();
        }
    }

    onEditClick(id) {
        return () => {
            this.props.history.push(`/dashboard/edit/${id}`);
        }
    }

    handleChange(event) {
        event.preventDefault();
        this.setState({ searchTerm: event.target.value });
    }

    handleRedirect(id) {
        return () => {
            this.props.history.push(`/dashboard/edit/${id}`);
        }
    }

    renderDashboardRows() {
        let events = this.props.events;
        if (this.state.searchTerm) {
            events = events.filter(event => event.title.toLowerCase().includes(this.state.searchTerm.toLowerCase()))
        }

        let dashboardRows = events.map((event, idx) => {
            return <DashboardRow
                key={`row-${idx}`}
                title={event.title}
                venueName={event.venueName}
                beginMonth={toMonth(event.beginMonth)}
                beginDay={event.beginDay}
                beginTime={toTime(event.beginTime)}
                imgSrc={event.pictureUrl || window.photoBalloons}
                onImgClick={this.handleRedirect(event.id)}
                onTitleClick={this.handleRedirect(event.id)}
                onEditClick={this.onEditClick(event.id)}
                onDeleteClick={this.onDeleteClick(event.id)}
            />
        });

        return dashboardRows;
    }

    render() { 
        return (  
            <div className="dashboard-home">
                <div><h1>Events</h1></div>
                <div className="dashboard-search">
                    <img src={window.searchIcon}/>
                    <input 
                        type="text" 
                        placeholder="Search events" 
                        onChange={this.handleChange} 
                    />
                </div>
                <header className="dashboard-index-head">
                    <span>Event</span>
                </header>
                {this.renderDashboardRows()}
            </div>
        );
    }
}
 
export default withRouter(Dashboard);