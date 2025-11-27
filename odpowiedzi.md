## Zadanie 1.

### 1.

```
curl.exe -X POST http://localhost:3000/api/login -H "Content-Type: application/json" -d '{\"username\":\"student\", \"password\":\"password\"}'
```


### 2.

```
curl -X POST http://localhost:3000/hacker/decode -H "Content-Type: application/json" -d '{"token":"WKLEJ_TOKEN_TUTAJ"}'
```

### 3.

```javascript
const payload = { 
    id: user.id, 
    username: user.username, 
    role: user.role 
    // Brak pola creditCard!
};
```