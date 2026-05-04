from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__)
app.config['SECRET_KEY'] = 'education_website_secret'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# ==========================================
# 1. DATABASE MODELS (The Schema)[cite: 1]
# ==========================================

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)
    role = db.Column(db.String(50), default='student') # student, admin, lecturer

class Course(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    module = db.Column(db.String(100))
    content_type = db.Column(db.String(50)) # video, notes, quiz
    resource_url = db.Column(db.String(300))

class ForumPost(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    author = db.Column(db.String(150), nullable=False)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class Book(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(100))
    price = db.Column(db.Float, nullable=False)
    stock = db.Column(db.Integer, default=10)

# Initialize Database
with app.app_context():
    db.create_all()

# ==========================================
# 2. HTML PAGE ROUTES
# ==========================================

@app.route('/')
def home(): return render_template('index.html')

@app.route('/portal')
def portal(): return render_template('portal.html')

@app.route('/courses')
def courses(): return render_template('courses.html')

@app.route('/forum')
def forum(): return render_template('forum.html')

@app.route('/bookstore')
def bookstore(): return render_template('bookstore.html')

# ==========================================
# 3. API ENDPOINTS (The Logic)[cite: 1]
# ==========================================

# --- Module 3: Student Portal (Auth) ---
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    if User.query.filter_by(username=data['username']).first():
        return jsonify({"error": "User already exists"}), 400
    
    new_user = User(username=data['username'], password=data['password'])
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "Registration successful"})

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['username'], password=data['password']).first()
    if user:
        return jsonify({"message": "Login successful", "username": user.username, "role": user.role})
    return jsonify({"error": "Invalid credentials"}), 401

# --- Module 2: Course Content ---
@app.route('/api/courses', methods=['GET'])
def get_courses():
    courses = Course.query.all()
    return jsonify([{"id": c.id, "title": c.title, "module": c.module, "type": c.content_type} for c in courses])

# --- Module 4: Discussion Forum ---
@app.route('/api/forum', methods=['GET', 'POST'])
def handle_forum():
    if request.method == 'POST':
        data = request.get_json()
        new_post = ForumPost(author=data['author'], content=data['content'])
        db.session.add(new_post)
        db.session.commit()
        return jsonify({"message": "Post created successfully"})
    
    posts = ForumPost.query.order_by(ForumPost.timestamp.desc()).all()
    return jsonify([{"id": p.id, "author": p.author, "content": p.content, "time": p.timestamp} for p in posts])

# --- Module 5: Bookstore & Checkout ---
@app.route('/api/books', methods=['GET'])
def get_books():
    books = Book.query.all()
    return jsonify([{"id": b.id, "title": b.title, "category": b.category, "price": b.price, "stock": b.stock} for b in books])

@app.route('/api/checkout', methods=['POST'])
def checkout():
    data = request.get_json()
    cart_items = data.get('cart', []) # Expects a list of book IDs
    
    total_cost = 0
    for book_id in cart_items:
        book = Book.query.get(book_id)
        if book and book.stock > 0:
            book.stock -= 1 # Deduct inventory
            total_cost += book.price
        else:
            return jsonify({"error": f"Book ID {book_id} is out of stock"}), 400
            
    db.session.commit()
    return jsonify({"message": "Purchase successful", "total_paid": total_cost})

if __name__ == '__main__':
    app.run(debug=True)