const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Lesson = require('./models/Lesson');

dotenv.config();

const curatedVideos = [
    {
        url: "https://www.youtube.com/embed/y564shf6_G8",
        title: "Climate Change 101",
        description: "A deep dive into the statistics of global warming and its impact on our planet.",
        thumbnail: "https://img.youtube.com/vi/y564shf6_G8/maxresdefault.jpg"
    },
    {
        url: "https://www.youtube.com/embed/HQTUWK7CM-Y",
        title: "The Plastic Problem",
        description: "Understanding the lifecycle of plastic and its devastating effect on marine life.",
        thumbnail: "https://img.youtube.com/vi/HQTUWK7CM-Y/maxresdefault.jpg"
    },
    {
        url: "https://www.youtube.com/embed/S8pB1f92eXw",
        title: "Renewable Energy Revolution",
        description: "How solar and wind power are transforming our energy grid.",
        thumbnail: "https://img.youtube.com/vi/S8pB1f92eXw/maxresdefault.jpg"
    },
    {
        url: "https://www.youtube.com/embed/v6ubvEJ3KGM",
        title: "Ecosystems and Energy Flow",
        description: "Explore how energy moves through nature and the role of carbon sinks.",
        thumbnail: "https://img.youtube.com/vi/v6ubvEJ3KGM/maxresdefault.jpg"
    },
    {
        url: "https://www.youtube.com/embed/G4H1N_yXBiA",
        title: "Sustainability Explained",
        description: "Practical steps for living a more sustainable life.",
        thumbnail: "https://img.youtube.com/vi/G4H1N_yXBiA/maxresdefault.jpg"
    },
    {
        url: "https://www.youtube.com/embed/0Puv0Pss33M",
        title: "Biodiversity Matters",
        description: "Why the variety of life on Earth is essential for our survival.",
        thumbnail: "https://img.youtube.com/vi/0Puv0Pss33M/maxresdefault.jpg"
    }
];

const fixVideos = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB...');

        const lessons = await Lesson.find({ type: 'video' });
        console.log(`🔍 Found ${lessons.length} video lessons to update...`);

        let updateCount = 0;
        for (let i = 0; i < lessons.length; i++) {
            const lesson = lessons[i];
            const videoData = curatedVideos[i % curatedVideos.length];

            lesson.video = {
                url: videoData.url,
                duration: 300,
                thumbnail: videoData.thumbnail
            };

            // Also ensure content has a mention of the video and quiz tips
            if (!lesson.content.includes('Watch the video')) {
                lesson.content = `${lesson.content}\n\n### 🎥 Lesson Video\nWatch the video below to understand these concepts in detail. Pay close attention to the statistics mentioned, as they will appear in your quiz!\n\n---\n`;
            }

            await lesson.save();
            updateCount++;
            if (updateCount % 50 === 0) {
                console.log(`⏳ Progress: ${updateCount}/${lessons.length}...`);
            }
        }

        console.log(`✨ Successfully updated ${updateCount} lessons with working videos and thumbnails!`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error fixing videos:', error);
        process.exit(1);
    }
};

fixVideos();
