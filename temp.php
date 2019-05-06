<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>PHP 시작!</title>
</head>
<body>
    <table border="1">
        <tr>
            <th>아이디</th>
            <th>이름</th>
            <th>돈</th>
        </tr>
    <?php
        require("db.php");
        $sql = "SELECT * FROM users";

        $q = $con->prepare($sql); 
        $q->execute();

        //하나씩 다 가져와줌 / $list는 배열이 됨
        $list = $q->fetchAll(PDO::FETCH_OBJ); //PDO의 static을 참조할때 ::을 쓴다. / PDO: Php Database Object
        
        foreach($list as $user) {
            echo "<tr>";
            echo "<td>$user->id</td>";
            echo "<td>$user->name</td>";
            echo "<td>$user->money</td>";
            echo "</tr>";
        }
    ?>
    </table>
</body>
</html>