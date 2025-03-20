import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import ical from "ical.js";

const app = express();
const port = 3000;

/*
    TESTING URL DE AIRBNB
    https://www.airbnb.es/calendar/ical/852190881961166531.ics?s=91eec208e2825e6d765dc69eda4849c9
    http://localhost:3000/calendar?url=https://www.airbnb.es/calendar/ical/852190881961166531.ics?s=91eec208e2825e6d765dc69eda4849c9
*/

// Middleware
app.use(cors());
app.use(express.json());

app.get('/calendar', async (req, res) => {
    try {
        const calendarUrl = req.query.url;

        if (!calendarUrl) {
            return res.status(400).json({ error: 'Missing URL parameter' });
        }

        const response = await fetch(calendarUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const icsData = await response.text();
        const jcalData = ical.parse(icsData);
        const component = new ical.Component(jcalData);
        const events = component.getAllSubcomponents('vevent');

        const parsedEvents = events.map(event => {
            const vevent = new ical.Event(event);
            return {
                start: vevent.startDate.toJSDate(),
                end: vevent.endDate.toJSDate(),
                summary: vevent.summary,
                description: vevent.description,
                location: vevent.location,
                uid: vevent.uid
            };
        });

        res.json({
            success: true,
            events: parsedEvents
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});