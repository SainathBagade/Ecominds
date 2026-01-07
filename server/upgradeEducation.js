const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Lesson = require('./models/Lesson');
const Grade = require('./models/Grade');
const Subject = require('./models/Subject');
const Module = require('./models/Module');

dotenv.config();

const educationData = {
    primary: { // Grades 4-6
        videos: [
            { url: "https://www.youtube.com/embed/sKJoXdrOT70", title: "What is an Ecosystem?" },
            { url: "https://www.youtube.com/embed/VlRVPumm4xc", title: "Reduce, Reuse, Recycle!" },
            { url: "https://www.youtube.com/embed/e6rglsLy1Ys", title: "Understanding Pollution" },
            { url: "https://www.youtube.com/embed/f93nle0GStI", title: "Saving Our Water" }
        ],
        descriptionPrefix: "Welcome young Eco-Explorer! In this lesson, we'll learn the fun basics of "
    },
    middle: { // Grades 7-9
        videos: [
            { url: "https://www.youtube.com/embed/G4H1N_yXBiA", title: "Sustainability Explained" },
            { url: "https://www.youtube.com/embed/S8pB1f92eXw", title: "The Clean Energy Revolution" },
            { url: "https://www.youtube.com/embed/HQTUWK7CM-Y", title: "The Global Plastic Crisis" },
            { url: "https://www.youtube.com/embed/BPJJM_hCFj0", title: "How the Greenhouse Effect Works" }
        ],
        descriptionPrefix: "Deepen your understanding of environmental science. We will investigate the mechanisms behind "
    },
    high: { // Grades 10-12
        videos: [
            { url: "https://www.youtube.com/embed/y564shf6_G8", title: "Climate Change Science 101" },
            { url: "https://www.youtube.com/embed/v6ubvEJ3KGM", title: "Energy Flow & Carbon Cycles" },
            { url: "https://www.youtube.com/embed/0Puv0Pss33M", title: "The Importance of Global Biodiversity" },
            { url: "https://www.youtube.com/embed/RmvNHiI_Mpw", title: "Innovative Technology for the Planet" }
        ],
        descriptionPrefix: "Advanced analysis of global environmental systems. This module focuses on the complex factors of "
    }
};

const upgradeEducation = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB...');

        const grades = await Grade.find().sort({ level: 1 });

        let totalUpdated = 0;

        for (const grade of grades) {
            let levelKey = 'primary';
            if (grade.level >= 7 && grade.level <= 9) levelKey = 'middle';
            if (grade.level >= 10) levelKey = 'high';

            const subjects = await Subject.find({ grade: grade._id });
            for (const subject of subjects) {
                const modules = await Module.find({ subject: subject._id });
                for (const module of modules) {
                    const lessons = await Lesson.find({ module: module._id });

                    for (let i = 0; i < lessons.length; i++) {
                        const lesson = lessons[i];
                        const videoSet = educationData[levelKey].videos;
                        const videoData = videoSet[i % videoSet.length];

                        lesson.type = 'video';
                        lesson.video = {
                            url: videoData.url,
                            duration: 300,
                            thumbnail: `https://img.youtube.com/vi/${videoData.url.split('/').pop()}/maxresdefault.jpg`
                        };

                        lesson.content = `# ${lesson.title}\n\n${educationData[levelKey].descriptionPrefix}${module.title.toLowerCase()}.\n\n### 🎥 Lesson Video\nWatch this curated video to learn more about the topic. Take notes on key points as they will be helpful for the upcoming quiz!\n\n---\n`;

                        await lesson.save();
                        totalUpdated++;
                    }
                }
            }
            console.log(`📡 Grade ${grade.level}: Updated lessons with ${levelKey}-level content.`);
        }

        console.log(`✨ Successfully upgraded ${totalUpdated} lessons with grade-appropriate working videos!`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error upgrading education content:', error);
        process.exit(1);
    }
};

upgradeEducation();
