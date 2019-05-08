<?php require("db.php"); ?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>펀드 매니저</title>
	<link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/login.css">
</head>

<body>
    <header>
        <div class="container">
            <div class="logo">
                창업 지원 펀드
            </div>

			<nav>
                <!-- isset => 무엇이 셋팅되어 있다면 -->
                <?php if(isset($_SESSION['user'])) : ?>
                    <div class="nav-btn">
                        <span><?= $_SESSION['user']->name ?></span>
                        <span><?= $_SESSION['user']->money ?></span>
                        <a href="/logout.php" class="btn btn-red">로그아웃</a>
                    </div>
                <?php else : ?>
                    <div class="nav-btn">
                        <a href="/login.php" class="btn btn-blue">로그인</a>
                        <a href="/register.php" class="btn btn-red">회원가입</a>
                    </div>
                <?php endif ?>
            </nav>
        </div>
    </header>
    <section id="content">
        <div class="inner-content">
			<div id="loginBox">
				<div class="tagFront">
					<p>Fund Manager!</p>
				</div>
				<div class="tagBack"></div>

				<div class="login">
					<div class="input">
						<form action="login_ok.php" method="post">
							<input type="text" placeholder="아이디" name="id" class="idInput">
							<input type="password" placeholder="비밀번호" name="password" class="pwInput">
						</form>
					</div>
					<a href="/login_ok.php" class="loginBtn">LOGIN</a>
					<a href="/register.php" class="signUp">회원가입</a>
				</div>
			</div>

			<div class="logoText">
				<p class="content">여러분의 투자를 쉽게 관리할수 있도록!</p>
				<p class="companyName">Fund Manager</p>
			</div>
        </div>
    </section>

    <div id="toastList">
        
    </div>
</body>

</html>