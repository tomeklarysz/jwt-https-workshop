const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const SECRET_KEY = 'super-tajne-haslo-bankowe';

// Baza użytkowników
const users = [
    { id: 1, username: 'student', password: 'password', role: 'user', creditCard: '4444-5555-6666-7777' },
    { id: 2, username: 'admin', password: 'adminpassword', role: 'admin', creditCard: '1111-2222-3333-4444' }
];

// =============================================================
// ZADANIE 4: HSTS (Strict Transport Security)
// =============================================================
// To middleware uruchamia się dla KAŻDEGO zapytania.

app.use((req, res, next) => {
    // Brak wymuszenia HTTPS.
    // Przeglądarka nie wie, że powinna łączyć się tylko szyfrowanym kanałem.
    // TODO #4: Odkomentuj poniższą linię, aby włączyć HSTS:
    
    // res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    
    next();
});


// --- ZADANIE 1: WYCIEK DANYCH (Information Disclosure) ---

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        // TODO #1
        
        const payload = { ...user }; // <--- TU JEST BŁĄD
        
        const token = jwt.sign(payload, SECRET_KEY, { algorithm: 'HS256' });
        res.json({ token });
    } else {
        res.status(401).json({ message: 'Błędne dane' });
    }
});


// --- ZADANIE 2: NONE ALGORITHM ATTACK (Bypass) ---

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    // Dekodujemy nagłówek, żeby sprawdzić algorytm
    const decoded = jwt.decode(token, { complete: true });
    
    if (!decoded) return res.sendStatus(403);

    // TODO #2
    
    if (decoded.header.alg === 'None' || decoded.header.alg === 'none') {
        console.log('UWAGA: Serwer zaakceptował algorytm None!');
        req.user = decoded.payload; 
        next();
    } else {
        // Normalna weryfikacja
        jwt.verify(token, SECRET_KEY, (err, user) => {
            if (err) return res.sendStatus(403);
            req.user = user;
            next();
        });
    }
};

// --- ZADANIE 3: SECURE COOKIES (Nagi transport ciasteczek) ---

app.post('/api/cookie-login', (req, res) => {
    // [VULNERABILITY 3]: Ciasteczko bez flag bezpieczeństwa
    // TODO: Dodaj secure: true oraz httpOnly: true
    res.cookie('session_id', 'tajna-sesja-123', { 
        maxAge: 900000,
        // secure: true,
        // httpOnly: true
    });
    res.json({ message: "Zapisano ciasteczko (sprawdź nagłówki!)" });
});

app.get('/api/admin', verifyToken, (req, res) => {
    if (req.user.role === 'admin') {
        res.json({ 
            status: 'SUCCESS', 
            secret_flag: 'CTF{WEWN_SERVER_HACKER}',
            user_data: req.user
        });
    } else {
        res.status(403).json({ error: "Brak uprawnień administratora." });
    }
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});


// --- HELPERY DLA HAKERA ---

// Helper 1:
// Pozwala podejrzeć, co tak naprawdę jest w tokenie (dekodowanie Base64)
app.post('/hacker/decode', (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(400).send("Podaj token!");
    
    const decoded = jwt.decode(token, { complete: true });
    res.json({ 
        message: "Oto co widzi haker po przechwyceniu tokena:",
        content: decoded 
    });
});

// Helper 2:
// Generuje token z algorytmem 'None' dla podanego payloadu
app.post('/hacker/forge', (req, res) => {
    const payload = req.body;
    
    // Ręczne tworzenie tokena "None" (bez podpisu)
    const header = { alg: "None", typ: "JWT" };
    
    const base64Url = (obj) => Buffer.from(JSON.stringify(obj))
        .toString('base64').replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

    // Token kończy się kropką, bo nie ma sygnatury!
    const forgedToken = `${base64Url(header)}.${base64Url(payload)}.`;
    
    res.json({ 
        message: "Wygenerowano złośliwy token (Alg: None)",
        forgedToken: forgedToken 
    });
});