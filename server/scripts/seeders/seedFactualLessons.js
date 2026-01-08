const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Lesson = require('../../models/Lesson');
const Module = require('../../models/Module');

dotenv.config();

const factualData = [
    {
        title: "The Reality of Climate Change",
        content: `### Global Temperature Rise\nMost of the warming occurred in the past 40 years, with the seven most recent years being the warmest. The years 2016 and 2020 are tied for the warmest year on record.\n\n### Animated Learning\nAnimation helps visualize complex interactions in our atmosphere. Watch how CO2 molecules trap heat near the Earth's surface.\n\n### Factual Statistics\n- **Arctic Sea Ice:** Declining at a rate of 12.6% per decade.\n- **Sea Level:** Rising 3.3 millimeters per year globally.\n- **Carbon Dioxide:** Current levels are 420 parts per million, the highest in 800,000 years.`,
        videoUrl: "https://www.youtube.com/embed/y564shf6_G8",
        type: 'video'
    },
    {
        title: "Plastic Pollution Crisis",
        content: `### The Life of Plastic\nEvery piece of plastic ever made still exists today. It takes roughly 450 years for a plastic bottle to decompose in the ocean.\n\n### Impact on Wildlife\nRoughly 100,000 marine mammals die every year from plastic entanglement or ingestion. Microplastics have now been found in the human bloodstream.\n\n### Real Data\n- **Production:** Over 400 million tons of plastic are produced annually.\n- **Recycling:** Only 9% of all plastic waste ever produced has been recycled.\n- **Ocean Waste:** 8 million tons of plastic enter the ocean every year.`,
        videoUrl: "https://www.youtube.com/embed/HQTUWK7CM-Y",
        type: 'video'
    },
    {
        title: "Renewable Energy Revolution",
        content: `### Solar & Wind Power\nSolar energy is the most abundant energy resource on earth. Enough sunlight strikes the Earth's surface in 1.5 hours to power the entire world's energy consumption for a year.\n\n### Fractal Efficiency\nAdvancements in grid technology and storage are making renewables more reliable than ever.\n\n### Key Facts\n- **Cost:** Solar costs have dropped by 82% since 2010.\n- **Jobs:** The renewable energy sector employs over 12 million people worldwide.\n- **Global Share:** Renewable energy generated 30% of global electricity in 2023.`,
        videoUrl: "https://www.youtube.com/embed/S8pB1f92eXw",
        type: 'video'
    }
];

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB for factual seeding');

        const firstModule = await Module.findOne();
        if (!firstModule) {
            console.error('❌ No modules found. Please run initial seeding first.');
            process.exit(1);
        }

        console.log(`Using Module: ${firstModule.title}`);

        for (const data of factualData) {
            const lesson = await Lesson.findOneAndUpdate(
                { title: data.title },
                {
                    module: firstModule._id,
                    content: data.content,
                    video: {
                        url: data.videoUrl,
                        duration: 300,
                        thumbnail: `https://img.youtube.com/vi/${data.videoUrl.split('/').pop()}/0.jpg`
                    },
                    type: data.type,
                    order: Math.floor(Math.random() * 100),
                    completionPoints: 10
                },
                { upsert: true, new: true }
            );
            console.log(`🚀 Seeded/Updated Lesson: ${lesson.title}`);
        }

        console.log('✨ Factual data and animated videos successfully integrated!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding factual data:', error);
        process.exit(1);
    }
};

seed();
