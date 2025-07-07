<!DOCTYPE html>
<html>
<head>
    <title>Test Login</title>
</head>
<body>
    <h2>Test Login Form</h2>
    
    @if($errors->any())
        <div style="color: red;">
            @foreach($errors->all() as $error)
                <p>{{ $error }}</p>
            @endforeach
        </div>
    @endif
    
    <form method="POST" action="{{ route('login') }}">
        @csrf
        <div>
            <label for="email">Email:</label>
            <input type="email" name="email" value="admin@example.com" required>
        </div>
        <div>
            <label for="password">Password:</label>
            <input type="password" name="password" value="password" required>
        </div>
        <div>
            <input type="checkbox" name="remember" value="1">
            <label for="remember">Remember me</label>
        </div>
        <button type="submit">Login</button>
    </form>
</body>
</html>