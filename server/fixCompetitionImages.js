const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Competition = require('./models/Competition');

dotenv.config();

const competitionImages = {
    'Spring Green Challenge 2024': 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=800',
    'Winter Waste Warriors': 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=800',
    'Autumn Sustainability Sprint': 'https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?auto=format&fit=crop&q=80&w=800',
    'Summer Eco Olympics 2025': 'https://media.istockphoto.com/id/2169297693/photo/young-woman-with-dog-explores-waterfall.jpg?s=2048x2048&w=is&k=20&c=SpvYGtzqskd71YZgcy08ldyGhL-S3HaMiTI4zWY6bYQ=',
    'Climate Action Battle Royale': 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=800',
    'Green Team League': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800',
    'Green Innovation Challenge': 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=800',
    'Eco-Quiz Championship': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800',
    'Events': 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800'
};

const fixCompetitionImages = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🔌 Connected to DB...');

        const competitions = await Competition.find();
        console.log(`Found ${competitions.length} competitions to update.`);

        const now = new Date();
        const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        for (const comp of competitions) {
            // Update Image
            const newImage = competitionImages[comp.title];
            if (newImage) {
                comp.image = newImage;
            } else {
                comp.image = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800';
            }

            // Update Dates IF it's one of the ones the user wants to see
            // This ensures they show up in "Upcoming/Ongoing" on the dashboard
            if (['Autumn Sustainability Sprint', 'Spring Green Challenge 2024', 'Green Innovation Challenge', 'Winter Waste Warriors'].includes(comp.title)) {
                comp.startDate = now;
                comp.endDate = nextMonth;
                comp.registrationStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                comp.registrationEnd = nextMonth;
                comp.status = 'in_progress';
                console.log(`📅 Reset dates and status for: ${comp.title}`);
            }

            await comp.save();
            console.log(`✅ Updated: ${comp.title}`);
        }

        console.log('✨ Competition images and visibility fixed!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

fixCompetitionImages();
