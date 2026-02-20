import json
from datetime import datetime, timedelta
import random
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, SessionLocal, Base
from config import get_settings
import models
from auth import hash_password

# Import all routers
from routers import users, topics, quizzes, attempts, progress, recommendations

settings = get_settings()

app = FastAPI(
    title="Personalised Learning API",
    description="Adaptive learning platform with ML-powered recommendations",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(users.router)
app.include_router(topics.router)
app.include_router(quizzes.router)
app.include_router(attempts.router)
app.include_router(progress.router)
app.include_router(recommendations.router)


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "Personalised Learning API is running"}


@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}


# ── Seed Data ─────────────────────────────────────────────────────────
SEED_TOPICS = [
    {"name": "Python Fundamentals", "description": "Variables, loops, functions, and OOP in Python", "category": "Programming"},
    {"name": "Machine Learning Basics", "description": "Supervised and unsupervised learning concepts", "category": "AI/ML"},
    {"name": "Neural Networks Basics", "description": "Perceptrons, layers, activation functions", "category": "AI/ML"},
    {"name": "Data Structures", "description": "Arrays, stacks, queues, trees, and graphs", "category": "Computer Science"},
    {"name": "Statistics & Probability", "description": "Descriptive statistics, distributions, hypothesis testing", "category": "Mathematics"},
    {"name": "Web Development", "description": "HTML, CSS, JavaScript, REST APIs", "category": "Programming"},
    {"name": "Databases & SQL", "description": "Relational databases, SQL queries, normalization", "category": "Computer Science"},
    {"name": "Deep Learning", "description": "CNNs, RNNs, transformers and training techniques", "category": "AI/ML"},
]

SEED_QUIZZES = [
    {
        "title": "Python Basics Quiz",
        "topic_idx": 0,
        "difficulty": "Beginner",
        "questions": [
            {"text": "What is the output of: print(type([]))?", "options": ["<class 'tuple'>", "<class 'list'>", "<class 'dict'>", "<class 'set'>"], "correct": 1},
            {"text": "Which keyword defines a function in Python?", "options": ["func", "def", "function", "lambda"], "correct": 1},
            {"text": "What does `len('hello')` return?", "options": ["4", "5", "6", "hello"], "correct": 1},
            {"text": "How do you create a dictionary in Python?", "options": ["[]", "()", "{}", "<>"], "correct": 2},
            {"text": "What is the correct way to comment in Python?", "options": ["// comment", "/* comment */", "# comment", "-- comment"], "correct": 2},
        ],
    },
    {
        "title": "Python Intermediate Challenges",
        "topic_idx": 0,
        "difficulty": "Intermediate",
        "questions": [
            {"text": "What does a list comprehension `[x**2 for x in range(5)]` produce?", "options": ["[1,4,9,16,25]", "[0,1,4,9,16]", "[0,2,4,6,8]", "[1,2,3,4,5]"], "correct": 1},
            {"text": "What is a decorator in Python?", "options": ["A CSS feature", "A function that wraps another function", "A class attribute", "A loop modifier"], "correct": 1},
            {"text": "What does `*args` do in a function?", "options": ["Collects keyword args into dict", "Collects positional args into tuple", "Multiplies arguments", "None of above"], "correct": 1},
            {"text": "Which is an immutable type?", "options": ["list", "dict", "tuple", "set"], "correct": 2},
            {"text": "Generators use which keyword to yield values?", "options": ["return", "produce", "yield", "emit"], "correct": 2},
        ],
    },
    {
        "title": "ML Fundamentals Quiz",
        "topic_idx": 1,
        "difficulty": "Beginner",
        "questions": [
            {"text": "What type of learning uses labelled data?", "options": ["Unsupervised", "Reinforcement", "Supervised", "Self-supervised"], "correct": 2},
            {"text": "K-Means is an example of ___ learning.", "options": ["Supervised", "Unsupervised", "Reinforcement", "Deep"], "correct": 1},
            {"text": "Overfitting means the model performs well on:", "options": ["Test data", "New data", "Training data", "All data"], "correct": 2},
            {"text": "Which metric is used for classification accuracy?", "options": ["MSE", "R²", "F1-Score", "MAE"], "correct": 2},
            {"text": "Feature scaling is important for:", "options": ["Decision Trees", "KNN and SVM", "Naive Bayes", "Random Forest"], "correct": 1},
        ],
    },
    {
        "title": "Neural Networks Quiz",
        "topic_idx": 2,
        "difficulty": "Intermediate",
        "questions": [
            {"text": "What is an activation function?", "options": ["Weight initializer", "Non-linearity applied to neuron output", "Loss calculator", "Data normalizer"], "correct": 1},
            {"text": "ReLU stands for:", "options": ["Rectified Linear Unit", "Recursive Learning Unit", "Random Linear Update", "Recurrent Layer Unit"], "correct": 0},
            {"text": "Backpropagation computes:", "options": ["Forward pass", "Gradients of loss wrt weights", "Activation values", "Layer outputs"], "correct": 1},
            {"text": "Dropout is used to prevent:", "options": ["Underfitting", "Overfitting", "Vanishing gradients", "Slow training"], "correct": 1},
            {"text": "CNNs are best suited for:", "options": ["Time series", "Text data", "Image data", "Tabular data"], "correct": 2},
        ],
    },
    {
        "title": "Data Structures Basics",
        "topic_idx": 3,
        "difficulty": "Beginner",
        "questions": [
            {"text": "Which data structure uses LIFO order?", "options": ["Queue", "Stack", "Linked List", "Tree"], "correct": 1},
            {"text": "Time complexity of binary search?", "options": ["O(n)", "O(n²)", "O(log n)", "O(1)"], "correct": 2},
            {"text": "A tree with no cycles and n nodes has how many edges?", "options": ["n", "n-1", "n+1", "2n"], "correct": 1},
            {"text": "Which traversal visits root before children?", "options": ["Inorder", "Postorder", "Preorder", "BFS"], "correct": 2},
            {"text": "Hash Map lookup average time complexity:", "options": ["O(n)", "O(log n)", "O(1)", "O(n log n)"], "correct": 2},
        ],
    },
    {
        "title": "Statistics Fundamentals",
        "topic_idx": 4,
        "difficulty": "Beginner",
        "questions": [
            {"text": "What is the median of [1, 3, 5, 7, 9]?", "options": ["3", "5", "7", "4"], "correct": 1},
            {"text": "Standard deviation measures:", "options": ["Central tendency", "Data spread", "Correlation", "Probability"], "correct": 1},
            {"text": "A p-value < 0.05 typically indicates:", "options": ["Null hypothesis accepted", "Statistical significance", "No effect", "Weak correlation"], "correct": 1},
            {"text": "The normal distribution is also called:", "options": ["Poisson curve", "Bell curve", "Uniform curve", "Chi curve"], "correct": 1},
            {"text": "Pearson correlation ranges from:", "options": ["0 to 1", "-1 to 0", "-1 to 1", "0 to ∞"], "correct": 2},
        ],
    },
    {
        "title": "Web Dev Basics",
        "topic_idx": 5,
        "difficulty": "Beginner",
        "questions": [
            {"text": "HTML stands for:", "options": ["Hyper Text Markup Language", "High Tech Modern Language", "Hyper Transfer Markup Lite", "None"], "correct": 0},
            {"text": "CSS property to change text color:", "options": ["font-color", "text-color", "color", "foreground"], "correct": 2},
            {"text": "REST API uses which protocol?", "options": ["FTP", "SMTP", "HTTP", "SSH"], "correct": 2},
            {"text": "JSON stands for:", "options": ["JavaScript Output Notation", "JavaScript Object Notation", "Java Script Object Name", "None"], "correct": 1},
            {"text": "Status code 404 means:", "options": ["Server Error", "Unauthorized", "Not Found", "Success"], "correct": 2},
        ],
    },
    {
        "title": "SQL Essentials",
        "topic_idx": 6,
        "difficulty": "Beginner",
        "questions": [
            {"text": "Which SQL statement retrieves data?", "options": ["INSERT", "UPDATE", "SELECT", "DELETE"], "correct": 2},
            {"text": "JOIN combines rows from:", "options": ["One table", "Two or more tables", "Subqueries only", "Views only"], "correct": 1},
            {"text": "PRIMARY KEY must be:", "options": ["Nullable", "Unique and not null", "Foreign key", "Auto-increment"], "correct": 1},
            {"text": "GROUP BY is used with:", "options": ["ORDER BY", "WHERE", "Aggregate functions", "LIMIT"], "correct": 2},
            {"text": "HAVING filters:", "options": ["Individual rows", "Grouped rows", "Joined tables", "Null values"], "correct": 1},
        ],
    },
]


def seed_database():
    db = SessionLocal()
    try:
        if db.query(models.User).count() > 0:
            return  # Already seeded

        # Demo user
        demo_user = models.User(
            name="Demo Student",
            email="demo@learn.ai",
            hashed_password=hash_password("demo1234"),
        )
        db.add(demo_user)
        db.flush()

        # Topics
        topic_objs = []
        for t in SEED_TOPICS:
            topic = models.Topic(**t)
            db.add(topic)
            topic_objs.append(topic)
        db.flush()

        # Quizzes + Questions
        quiz_objs = []
        for q_data in SEED_QUIZZES:
            quiz = models.Quiz(
                title=q_data["title"],
                topic_id=topic_objs[q_data["topic_idx"]].id,
                difficulty_level=q_data["difficulty"],
            )
            db.add(quiz)
            db.flush()
            for qst in q_data["questions"]:
                question = models.Question(
                    quiz_id=quiz.id,
                    text=qst["text"],
                    options_json=json.dumps(qst["options"]),
                    correct_answer=qst["correct"],
                )
                db.add(question)
            quiz_objs.append(quiz)

        db.flush()

        # Seed some attempts for the demo user so recommendations work immediately
        random.seed(42)
        for i, quiz in enumerate(quiz_objs[:5]):
            questions = db.query(models.Question).filter(models.Question.quiz_id == quiz.id).all()
            # Simulate varied performance: first 2 quizzes low, rest high
            score_base = 40 if i < 2 else 80
            correct = max(1, int(len(questions) * (score_base + random.randint(-10, 10)) / 100))
            correct = min(correct, len(questions))
            score = round((correct / len(questions)) * 100, 2)
            attempt = models.QuizAttempt(
                user_id=demo_user.id,
                quiz_id=quiz.id,
                score=score,
                total_questions=len(questions),
                correct_answers=correct,
                time_taken_s=random.randint(60, 300),
                answers_json=json.dumps([0] * len(questions)),
                attempted_at=datetime.utcnow() - timedelta(days=i),
            )
            db.add(attempt)

        db.commit()
        print("✅ Database seeded successfully")
    except Exception as e:
        db.rollback()
        print(f"⚠️  Seed error (may already be seeded): {e}")
    finally:
        db.close()


# Create tables and seed on startup
Base.metadata.create_all(bind=engine)
seed_database()
