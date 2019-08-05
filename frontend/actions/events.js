export const RECEIVE_EVENT = 'RECEIVE_EVENT';
export const RECEIVE_EVENTS = 'RECEIVE_EVENTS';
import * as ApiEventsUtil from '../util/events';

const receiveEvent = (event) => ({
    type: RECEIVE_EVENT,
    event
});

const receiveEvents = (events) => ({
    type: RECEIVE_EVENTS,
    events
});

export const fetchEvent = (id) => dispatch => {
    return ApiEventsUtil.fetchEvent(id).then(
        event => dispatch(receiveEvent(event))
    );
}

export const postEvent = (event) => dispatch => {
    return ApiEventsUtil.postEvent(event).then(
        event => dispatch(receiveEvent(event))
    );
}

export const fetchEvents = () => dispatch => {
    return ApiEventsUtil.fetchEvents().then(
        events => dispatch(receiveEvents(events))
    );
}

export const postRegistration = (eventId) => dispatch => {
    debugger
    return ApiEventsUtil.postRegistration(eventId).then(
        event => dispatch(receiveEvents(event))
    );
}

