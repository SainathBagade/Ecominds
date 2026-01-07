const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Quiz = require('./models/Quiz');
const Question = require('./models/Question');
const Lesson = require('./models/Lesson');

dotenv.config();

const questionData = {
    "Climate Change": [
        {
            text: "What is the current concentration of Carbon Dioxide (CO2) in our atmosphere?",
            options: [
                { text: "280 ppm", isCorrect: false },
                { text: "420 ppm", isCorrect: true },
                { text: "550 ppm", isCorrect: false },
                { text: "100 ppm", isCorrect: false }
            ],
            correctAnswer: "420 ppm",
            explanation: "Current CO2 levels have reached 420 parts per million, the highest in 800,000 years."
        },
        {
            text: "At what rate is the Arctic Sea Ice declining per decade?",
            options: [
                { text: "2.5%", isCorrect: false },
                { text: "12.6%", isCorrect: true },
                { text: "25%", isCorrect: false },
                { text: "5%", isCorrect: false }
            ],
            correctAnswer: "12.6%",
            explanation: "Arctic Sea Ice is declining at a staggering rate of 12.6% per decade due to global warming."
        },
        {
            text: "Most of the global warming on record has occurred within the past how many years?",
            options: [
                { text: "10 years", isCorrect: false },
                { text: "100 years", isCorrect: false },
                { text: "40 years", isCorrect: true },
                { text: "200 years", isCorrect: false }
            ],
            correctAnswer: "40 years",
            explanation: "Most warming has occurred in the past 40 years, with 2016 and 2020 being the warmest years."
        },
        {
            text: "What is the primary greenhouse gas emitted by human activities?",
            options: [
                { text: "Oxygen", isCorrect: false },
                { text: "Carbon Dioxide", isCorrect: true },
                { text: "Nitrogen", isCorrect: false },
                { text: "Helium", isCorrect: false }
            ],
            correctAnswer: "Carbon Dioxide",
            explanation: "Carbon dioxide (CO2) is the primary greenhouse gas emitted through human activities like burning fossil fuels."
        },
        {
            text: "Which sector contributes most to global greenhouse gas emissions?",
            options: [
                { text: "Agriculture", isCorrect: false },
                { text: "Transportation", isCorrect: false },
                { text: "Energy (Electricity and Heat)", isCorrect: true },
                { text: "Fashion", isCorrect: false }
            ],
            correctAnswer: "Energy (Electricity and Heat)",
            explanation: "The energy sector is responsible for roughly 75% of global greenhouse gas emissions."
        }
    ],
    "Plastic Pollution": [
        {
            text: "Roughly how many years does it take for a plastic bottle to decompose in the ocean?",
            options: [
                { text: "10 years", isCorrect: false },
                { text: "50 years", isCorrect: false },
                { text: "450 years", isCorrect: true },
                { text: "Never", isCorrect: false }
            ],
            correctAnswer: "450 years",
            explanation: "It takes roughly 450 years for a plastic bottle to fully decompose in marine environments."
        },
        {
            text: "How many marine mammals are estimated to die each year due to plastic pollution?",
            options: [
                { text: "1,000", isCorrect: false },
                { text: "10,000", isCorrect: false },
                { text: "100,000", isCorrect: true },
                { text: "1,000,000", isCorrect: false }
            ],
            correctAnswer: "100,000",
            explanation: "About 100,000 marine mammals die annually from plastic entanglement or ingestion."
        },
        {
            text: "Which color recycling bin is traditionally used for paper and cardboard?",
            options: [
                { text: "Green", isCorrect: false },
                { text: "Blue", isCorrect: true },
                { text: "Red", isCorrect: false },
                { text: "Yellow", isCorrect: false }
            ],
            correctAnswer: "Blue",
            explanation: "In most standard recycling systems, the Blue bin is designated for paper and cardboard."
        },
        {
            text: "What are 'Microplastics'?",
            options: [
                { text: "Giant plastic islands", isCorrect: false },
                { text: "Plastic pieces smaller than 5mm", isCorrect: true },
                { text: "Plastic used in microscopes", isCorrect: false },
                { text: "Biodegradable bags", isCorrect: false }
            ],
            correctAnswer: "Plastic pieces smaller than 5mm",
            explanation: "Microplastics are tiny plastic particles less than 5mm in diameter that pollute our oceans and food chain."
        },
        {
            text: "What percentage of plastic ever produced has been recycled?",
            options: [
                { text: "9%", isCorrect: true },
                { text: "50%", isCorrect: false },
                { text: "75%", isCorrect: false },
                { text: "100%", isCorrect: false }
            ],
            correctAnswer: "9%",
            explanation: "Only about 9% of all plastic waste ever generated has been recycled."
        }
    ],
    "Renewable Energy": [
        {
            text: "How much sunlight striking the Earth is needed to power the entire world for a year?",
            options: [
                { text: "1.5 hours", isCorrect: true },
                { text: "24 hours", isCorrect: false },
                { text: "1 week", isCorrect: false },
                { text: "1 month", isCorrect: false }
            ],
            correctAnswer: "1.5 hours",
            explanation: "Enough sunlight strikes the Earth's surface in just 1.5 hours to power global energy consumption for a year."
        },
        {
            text: "By what percentage have solar energy costs dropped since 2010?",
            options: [
                { text: "20%", isCorrect: false },
                { text: "50%", isCorrect: false },
                { text: "82%", isCorrect: true },
                { text: "95%", isCorrect: false }
            ],
            correctAnswer: "82%",
            explanation: "Solar costs have dropped by 82% since 2010, making it one of the cheapest energy sources."
        },
        {
            text: "Which of the following is considered a fossil fuel?",
            options: [
                { text: "Solar", isCorrect: false },
                { text: "Wind", isCorrect: false },
                { text: "Coal", isCorrect: true },
                { text: "Hydro", isCorrect: false }
            ],
            correctAnswer: "Coal",
            explanation: "Coal, oil, and natural gas are fossil fuels, while solar, wind, and hydro are renewable resources."
        },
        {
            text: "What is 'Geothermal Energy'?",
            options: [
                { text: "Energy from the wind", isCorrect: false },
                { text: "Energy from the Earth's internal heat", isCorrect: true },
                { text: "Energy from ocean tides", isCorrect: false },
                { text: "Energy from burning wood", isCorrect: false }
            ],
            correctAnswer: "Energy from the Earth's internal heat",
            explanation: "Geothermal energy is heat derived from within the sub-surface of the earth."
        },
        {
            text: "Which country produces the most wind energy globally?",
            options: [
                { text: "USA", isCorrect: false },
                { text: "China", isCorrect: true },
                { text: "Germany", isCorrect: false },
                { text: "India", isCorrect: false }
            ],
            correctAnswer: "China",
            explanation: "China is currently the world leader in wind power capacity."
        }
    ],
    "Ecosystems": [
        {
            text: "What do we call a community of living organisms interacting with their non-living environment?",
            options: [
                { text: "Population", isCorrect: false },
                { text: "Habitat", isCorrect: false },
                { text: "Ecosystem", isCorrect: true },
                { text: "Biome", isCorrect: false }
            ],
            correctAnswer: "Ecosystem",
            explanation: "An ecosystem includes all living things in a given area interacting with non-living components like weather, sun, and soil."
        },
        {
            text: "Which of these acts as a primary 'Carbon Sink' for the Earth?",
            options: [
                { text: "Deserts", isCorrect: false },
                { text: "Forests", isCorrect: true },
                { text: "Cities", isCorrect: false },
                { text: "Glaciers", isCorrect: false }
            ],
            correctAnswer: "Forests",
            explanation: "Forests are major carbon sinks, absorbing massive amounts of CO2 from the atmosphere."
        },
        {
            text: "Energy flows through an ecosystem primarily through what mechanism?",
            options: [
                { text: "Water cycles", isCorrect: false },
                { text: "Food Chains", isCorrect: true },
                { text: "Rock formations", isCorrect: false },
                { text: "Wind patterns", isCorrect: false }
            ],
            correctAnswer: "Food Chains",
            explanation: "Energy is transferred from producers to consumers through food chains and webs."
        },
        {
            text: "What are 'Apex Predators'?",
            options: [
                { text: "Plants that eat bugs", isCorrect: false },
                { text: "Animals at the top of the food chain", isCorrect: true },
                { text: "Bacteria that decompose waste", isCorrect: false },
                { text: "Animals that only eat grass", isCorrect: false }
            ],
            correctAnswer: "Animals at the top of the food chain",
            explanation: "Apex predators are those at the very top of their food chain, with no natural predators of their own."
        },
        {
            text: "What is 'Symbiosis'?",
            options: [
                { text: "A type of rock", isCorrect: false },
                { text: "A close interaction between two different species", isCorrect: true },
                { text: "The process of raining", isCorrect: false },
                { text: "A method of recycling", isCorrect: false }
            ],
            correctAnswer: "A close interaction between two different species",
            explanation: "Symbiosis is any type of a close and long-term biological interaction between two different biological organisms."
        }
    ],
    "Sustainability": [
        {
            text: "What percentage of all food produced globally is wasted annually?",
            options: [
                { text: "5%", isCorrect: false },
                { text: "15%", isCorrect: false },
                { text: "30%", isCorrect: true },
                { text: "50%", isCorrect: false }
            ],
            correctAnswer: "30%",
            explanation: "Roughly 30% of global food production is wasted, which is enough to feed millions."
        },
        {
            text: "Sustainability aims to meet current needs without compromising the ability of...?",
            options: [
                { text: "Rich nations", isCorrect: false },
                { text: "Future generations", isCorrect: true },
                { text: "Local businesses", isCorrect: false },
                { text: "Technology", isCorrect: false }
            ],
            correctAnswer: "Future generations",
            explanation: "Sustainability is defined as meeting our own needs without compromising the ability of future generations to meet theirs."
        },
        {
            text: "Using a water bottle multiple times instead of buying a new one is an example of which 'R'?",
            options: [
                { text: "Reduce", isCorrect: false },
                { text: "Reuse", isCorrect: true },
                { text: "Recycle", isCorrect: false },
                { text: "Refuse", isCorrect: false }
            ],
            correctAnswer: "Reuse",
            explanation: "Reuse involves using an item more than once to prevent it from becoming waste."
        },
        {
            text: "What is a 'Carbon Footprint'?",
            options: [
                { text: "A fossilized footprint", isCorrect: false },
                { text: "Total greenhouse gas emissions caused by an individual/org", isCorrect: true },
                { text: "The weight of a coal bag", isCorrect: false },
                { text: "A path made of charcoal", isCorrect: false }
            ],
            correctAnswer: "Total greenhouse gas emissions caused by an individual/org",
            explanation: "A carbon footprint is the total amount of greenhouse gases generated by our actions."
        },
        {
            text: "Which of the following is a 'Zero Waste' practice?",
            options: [
                { text: "Buying single-use items", isCorrect: false },
                { text: "Composting food scraps", isCorrect: true },
                { text: "Burning trash", isCorrect: false },
                { text: "Throwing plastic in the ocean", isCorrect: false }
            ],
            correctAnswer: "Composting food scraps",
            explanation: "Composting turns organic waste into nutrient-rich soil, preventing it from going to landfills."
        }
    ],
    "Biodiversity": [
        {
            text: "What term describes the variety of all living things on Earth?",
            options: [
                { text: "Ecology", isCorrect: false },
                { text: "Zoology", isCorrect: false },
                { text: "Biodiversity", isCorrect: true },
                { text: "Geography", isCorrect: false }
            ],
            correctAnswer: "Biodiversity",
            explanation: "Biodiversity is the shortened form of biological diversity, referring to all variety of life on Earth."
        },
        {
            text: "Why is high biodiversity beneficial for an ecosystem?",
            options: [
                { text: "It makes it look better", isCorrect: false },
                { text: "It makes it more resilient", isCorrect: true },
                { text: "It stops the rain", isCorrect: false },
                { text: "It increases heat", isCorrect: false }
            ],
            correctAnswer: "It makes it more resilient",
            explanation: "Higher biodiversity helps ecosystems recover more quickly from disasters and maintain balance."
        },
        {
            text: "What is the primary cause of biodiversity loss today?",
            options: [
                { text: "Natural aging", isCorrect: false },
                { text: "Habitat destruction", isCorrect: true },
                { text: "Space exploration", isCorrect: false },
                { text: "Volcanoes", isCorrect: false }
            ],
            correctAnswer: "Habitat destruction",
            explanation: "Human-driven habitat loss, primarily through deforestation and urban sprawl, is the leading cause of species loss."
        },
        {
            text: "What is an 'Endangered Species'?",
            options: [
                { text: "A species that is very common", isCorrect: false },
                { text: "A species at risk of extinction", isCorrect: true },
                { text: "A species that lives in caves", isCorrect: false },
                { text: "A new species discovered", isCorrect: false }
            ],
            correctAnswer: "A species at risk of extinction",
            explanation: "An endangered species is a type of organism that is threatened by extinction."
        },
        {
            text: "Which ecosystem is often called the 'Rainforest of the Sea'?",
            options: [
                { text: "Deep ocean trenches", isCorrect: false },
                { text: "Coral Reefs", isCorrect: true },
                { text: "Arctic Ocean", isCorrect: false },
                { text: "Salt Marshes", isCorrect: false }
            ],
            correctAnswer: "Coral Reefs",
            explanation: "Coral reefs support more species per unit area than any other marine environment."
        }
    ]
};

const seedUniqueQuizzes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB...');

        const lessons = await Lesson.find({ type: 'video' });
        console.log(`Processing ${lessons.length} video lessons...`);

        for (const lesson of lessons) {
            let quiz = await Quiz.findOne({ lesson: lesson._id });
            if (!quiz) {
                quiz = await Quiz.create({
                    title: `${lesson.title} Assessment`,
                    lesson: lesson._id,
                    description: `Test your knowledge on ${lesson.title}`,
                    timeLimit: 10,
                    passingScore: 60,
                    totalPoints: 50,
                    difficulty: 'medium'
                });
            } else {
                // Update quiz if it exists
                quiz.totalPoints = 50;
                await quiz.save();
            }

            await Question.deleteMany({ quiz: quiz._id });

            let topic = "Ecosystems";
            for (const key of Object.keys(questionData)) {
                if (lesson.title.includes(key) || lesson.content.includes(key)) {
                    topic = key;
                    break;
                }
            }

            const questions = questionData[topic];
            const quizQuestions = questions.map((q, index) => ({
                ...q,
                quiz: quiz._id,
                order: index + 1,
                points: 10
            }));

            await Question.insertMany(quizQuestions);
            console.log(`✅ Seeded 5 unique questions for quiz: ${quiz.title}`);
        }

        console.log('✨ All quizzes now have 5 unique questions!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding quizzes:', error);
        process.exit(1);
    }
};

seedUniqueQuizzes();
