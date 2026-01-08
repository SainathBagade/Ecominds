const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Lesson = require('../../models/Lesson');
const Module = require('../../models/Module');

dotenv.config();

const videoLessons = [
    {
        title: "Understanding Our Changing Climate",
        content: `### Global Temperature Rise
Most of the warming occurred in the past 40 years, with the seven most recent years being the warmest. The years 2016 and 2020 are tied for the warmest year on record.

### Key Climate Numbers
- **Carbon Dioxide:** Current levels are 420 parts per million, the highest in 800,000 years.
- **Sea Level:** Rising 3.3 millimeters per year globally.
- **Arctic Sea Ice:** Declining at a rate of 12.6% per decade.

*Watch the video to understand how these numbers impact our daily lives and how you can answer these in the quiz!*`,
        video: {
            url: "https://www.youtube.com/embed/y564shf6_G8",
            duration: 300,
            thumbnail: "/images/thumbnails/climate_crisis.png" // Placeholder, will guide user
        },
        type: 'video',
        duration: 10,
        completionPoints: 15
    },
    {
        title: "The Reality of Plastic Pollution",
        content: `### Every Piece Ever Made...
Every piece of plastic ever produced still exists today. It takes roughly 450 years for a plastic bottle to decompose in the ocean.

### Marine Impact
- **Annual Waste:** 8 million tons of plastic enter the ocean every year.
- **Wildlife:** Over 100,000 marine mammals die annually from entanglement or ingestion.
- **Recycling Basics:** The Blue Bin is typically for Paper and Cardboard.

*Master these facts to ace your next challenge!*`,
        video: {
            url: "https://www.youtube.com/embed/HQTUWK7CM-Y",
            duration: 240,
            thumbnail: "/images/thumbnails/plastic_pollution.png"
        },
        type: 'video',
        duration: 8,
        completionPoints: 15
    },
    {
        title: "Ecosystems: The Balance of Nature",
        content: `### What is an Ecosystem?
An ecosystem is a community of living organisms in conjunction with the nonliving components of their environment.

### Energy & Carbon
- **Energy Flow:** Moves through Food Chains from producers to consumers.
- **Carbon Sinks:** Forests act as nature's primary carbon sponges, absorbing CO2 from the atmosphere.

*Understanding these connections is vital for biodiversity conservation.*`,
        video: {
            url: "https://www.youtube.com/embed/v6ubvEJ3KGM",
            duration: 320,
            thumbnail: "/images/thumbnails/ecosystems.png"
        },
        type: 'video',
        duration: 12,
        completionPoints: 15
    },
    {
        title: "Renewable Energy Revolution",
        content: `### The Power of the Sun
Enough sunlight strikes the Earth's surface in 1.5 hours to power the entire world's energy consumption for a year.

### Economic Shift
- **Cost Reduction:** Solar costs have dropped by 82% since 2010.
- **Energy Types:** Wind, Solar, and Hydro are renewable, while Coal and Oil are fossil fuels.

*Explore how we can power the future without harming the planet.*`,
        video: {
            url: "https://www.youtube.com/embed/S8pB1f92eXw",
            duration: 280,
            thumbnail: "/images/thumbnails/renewable_energy.png"
        },
        type: 'video',
        duration: 9,
        completionPoints: 15
    }
];

const seedVideos = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB...');

        // Find the first module to attach these lessons to
        let targetModule = await Module.findOne({ title: /Introduction/i });
        if (!targetModule) {
            targetModule = await Module.findOne();
        }

        if (!targetModule) {
            console.error('❌ No modules found. Please run initial seeding first.');
            process.exit(1);
        }

        console.log(`Using Module: ${targetModule.title}`);

        for (const data of videoLessons) {
            await Lesson.findOneAndUpdate(
                { title: data.title },
                {
                    ...data,
                    module: targetModule._id,
                    isActive: true,
                    order: Math.floor(Math.random() * 100)
                },
                { upsert: true, new: true }
            );
            console.log(`🚀 Seeded Video Lesson: ${data.title}`);
        }

        console.log('✨ All video lessons successfully integrated into the Learn section!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding video lessons:', error);
        process.exit(1);
    }
};

seedVideos();
