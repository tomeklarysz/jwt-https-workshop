## Uruchom kontener

```
docker build -t jwt-lab . 
docker run -p 3000:3000 jwt-lab
```

## Zadanie 1.: Wyciek Danych

#### 1. Wykonanie żądania logowania

Wykonaj POST <http://localhost:3000/api/login>

W udanej odpowiedzi otrzymasz token JWT.

podpowiedź: jeśli używasz curl (curl.exe na windowsie), użyj 
```
-H "Content-Type: application/json" -d '{\"username\":\"student\", \"password\":\"password\"}'
```


#### 2. Dekodowanie tokenu

Zdekoduj token aby zobaczyć co się kryję w jego nagłówku. Możesz użyć narzędzia <https://token.dev/> lub wykonać zapytanie POST na <http://localhost:3000/hacker/decode>

Jakie pola widać w Header? Czy są to dane poufne?

#### 3. Naprawa kodu

Otwórz plik skryptu `server.js`, zmień kod tak, aby do payloadu nie trafiały wrażliwe dane 

#### 4. Restart serwera

Ctrl+C a następnie
```
docker build --no-cache -t jwt-workshop .
docker run -p 3000:3000 jwt-lab
```
#### 5. Weryfikacja

Powtórz krok 1. i 2. Karta kredytowa powinna zniknąć z nagłówka.


## Zadanie 2.: None Algorithm Attack

#### 1. Próba wejścia na admina swoim tokenem

Wykonaj zapytanie na /api/admin z użyciem swojego tokena:

```
curl.exe -H "Authorization: Bearer TOKEN_JWT" http://localhost:3000/api/admin
```

#### 2. Forge

Wygeneruj token z uprawnieniami admina i algorytmem None

```
curl.exe -X POST http://localhost:3000/hacker/forge -H "Content-Type: application/json" -d '{\"username\":\"hacker\", \"role\":\"admin\"}'
```

#### 3. Użyj wygenerowanego tokenu

```
curl.exe -H "Authorization: Bearer FORGED_TOKEN" http://localhost:3000/api/admin
```
Powinieneś otrzymać flagę

#### 4. Naprawa kodu

Zedytuj `server.js` tak aby wymagał od tokena podpisu.

podpowiedź: usuń blok `if`

#### 5. Restart

Ctrl+C a następnie
```
docker build --no-cache -t jwt-workshop .
docker run -p 3000:3000 jwt-lab
```

#### 6. Weryfikacja

Po restarcie ze zmianami, użycie sfałszowanego tokena powinno zwrócić błąd Forbidden, ponieważ oczekujemy podpisu.