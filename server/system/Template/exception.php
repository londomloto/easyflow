<!DOCTYPE html>
<html>
<head>
    <title><?php echo $name; ?></title>
    <style>
        * {
            box-sizing: border-box;
        }
        body {
            padding: 0;
            margin: 0;
            font-family: Consolas, Monaco, sans-serif;
        }
        h3, h4, p {
            margin: 0;
            padding: 0;
        }
        
        .container {
            
        }
        .item {
            padding: 10px 0;
        }
        label {
            font-weight: bold;
            display: block;
        }
        .line {
            display: block;
            height: 1px;
            background-color: #ccc;
            margin: 5px 0;
        }
        .header {
            padding: 20px;
            border-bottom: solid 4px #D64652;
            background-color: #f44455;
            color: #fff;
        }
        .body {
            padding: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h3><?php echo "{$code} {$name}"; ?></h3>
        </div>

        <div class="body">
            <div class="item">
                <label>Filename:</label>
                <p><?php echo $file; ?></p>
            </div>
            <div class="item">
                <label>Line:</label>
                <p><?php echo $line; ?></p>
            </div>
            <div class="item">
                <label>Message:</label>
                <p><?php echo $message; ?></p>
            </div>
            <div class="item">
                <label>Trace:</label>
                <ul>
                    
                
                <?php
                    $count = count($trace);

                    for ($i = 0; $i < $count; $i++) {
                        $curr = $trace[$i];
                        $item = '';

                        if (isset($curr['file'])) {
                            $item .= $curr['file'];
                        }

                        if (isset($curr['line'])) {
                            $item .= '(' . $curr['line'] . ')';
                        }

                        if (isset($curr['class'])) {
                            $item .= (! empty($item) ? ' : ' : '') . $curr['class'];

                            if (isset($curr['type'])) {
                                $item .= $curr['type'];
                            }

                            if (isset($curr['function'])) {
                                $item .= $curr['function'];
                                $item .= '(';
                                if (isset($curr['args'])) {
                                    $a = $curr['args'];
                                    $n = count($a);
                                    $p = array();

                                    for($j = 0; $j < $n; $j++) {
                                        if (is_string($a[$j])) {
                                            $p[] = '"'.$a[$j].'"';
                                        } else if (is_numeric($a[$j])) {
                                            $p[] = $a[$j];
                                        } else if (is_array($a[$j])) {
                                            $p[] = 'Array';
                                        } else if (is_object($a[$j])) {
                                            $p[] = ucfirst(gettype($a[$j])).'('.get_class($a[$j]).')';
                                        } else {
                                            $p[] = $a[$j];
                                        }
                                    }

                                    if (count($p)) {
                                        $item .= implode(', ', $p);
                                    }
                                }
                                $item .= ')';
                            }
                        }

                        if ( ! empty($item)) {
                            echo '<li>'.$item.'</li>';    
                        }
                    }

                ?>
                </ul>
            </div>
        </div>
        
    </div>
</body>
</html>