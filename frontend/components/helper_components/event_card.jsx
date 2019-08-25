import React from 'react';
import { Link } from 'react-router-dom';

export const EventCards = (props) => (
    <div className="events-cards">
        {props.children}
    </div>
);

export const EventCard = ({ cardImage, month, day, date, title, time, venueName, city, state, price, eventId, onLikeClick, liked }) => { 
    // const addressOrUrl = () => {
    //     // if the address does not have a physical location
    //     if (!city) {
    //         return `${venueName}`;
    //     } else {
    //         return `${venueName}, ${city}, ${state}`;
    //     }
    // }

    let addressOrUrl = !city ? `${venueName}` : `${venueName}, ${city}, ${state}`;
    let heartIconImg = liked ? window.redHeartIcon : window.heartIcon;

    return (
        <div className="event-card">
        <Link to={`events/${eventId}`}>
            <aside className="event-card-picture" 
                style={{backgroundImage: `url(${cardImage})`}}
            />
        </Link>
        <main className="event-card-details">
            <div className="card-buttons">
                <button className="event-card-button">
                    <img className="card-button-img" src={window.shareIcon}/>
                </button>
                <button className="event-card-button" onClick={onLikeClick}>
                    <img className="card-button-img" src={heartIconImg}/>
                </button>
            </div>
            <div className="splash-card-details flex">
                <div className="date-span">
                    <span className="month">
                        {month}
                    </span>
                    <span className="date">
                        {date}
                    </span>
                </div>
                <div className="card-details">
                    <Link to={`events/${eventId}`}>
                        <span className="card-title">
                            {title}
                        </span>
                    </Link>
                    <span className="card-date-time">
                        {`${day}, ${month} ${date}, ${time}`}
                    </span>
                    <span className="event-card-location">
                        {addressOrUrl}
                    </span>
                    <span className="card-price">
                        {`Starts at $${price}.00`}
                    </span>
                </div>
            </div>
        </main>
    </div>
    );
};

 