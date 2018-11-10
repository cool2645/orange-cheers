# orange-cheers

[中文 README](https://blog.cool2645.com/298)

A Single-Page-Application theme for WordPress.

## Thanks to

This theme is inspired by themes of the following blogs.
 
Thanks to them and their wonderful theme authors:

+ [Blessing Studio](http://blessing.studio/) 
+ [ことりのおやつにしてやるぞー！](https://kotori.love/)
+ [YumeのDiary](https://kirainmoe.com/)

## Technology Stack

+ React 16
+ TypeScript
+ Honoka
+ Monaco Editor
+ Typed.js
+ i18next

## How to use this

1. Install [this WordPress plugin](https://gist.github.com/rikakomoe/ec905d5378fbfbdd585ab63dfd39c609) to enable comments via REST API and pass raw HTML content to front-end.
2. Enable that plugin.
3. Clone this repository, modify `src/config.js` in case you need.
4. Build the project, 
    ```bash
    npm install
    npm run build 
    ```
5. Configure your http server. Here's an example:
    ```nginx
    # Virtual Host configuration for example.com
    #
    # You can move that to a different file under sites-available/ and symlink that
    # to sites-enabled/ to enable it.
    
    server {
        listen 80;
        listen [::]:80;
        server_name blog.cool2645.com;
        rewrite ^(.*) https://blog.cool2645.com$1 permanent;
    }
    server {
        listen 443;
        listen [::]:443;
    
        server_name blog.cool2645.com;
    
        root /var/www/blog;
        index index.htm index.html index.php;
    
        ssl on;
        ssl_certificate /etc/letsencrypt/live/www.cool2645.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/www.cool2645.com/privkey.pem;
        ssl_trusted_certificate /etc/letsencrypt/live/www.cool2645.com/chain.pem;
    
        rewrite /wp-admin$ $scheme://$host$uri/ permanent;
    
        location / {
            root /var/www/blog/orange-cheers;
            try_files $uri $uri/ /index.html;
        }
    
        location ~ \.php$ {
            include snippets/fastcgi-php.conf;
            # With php7.2-fpm:
            fastcgi_pass unix:/run/php/php7.2-fpm.sock;
        }
    
        location ~ /feed|wp-.*/ {
            try_files $uri $uri/ =404;
            if (-f $request_filename/index.html){  
                rewrite (.*) $1/index.html break;  
            }  
            if (-f $request_filename/index.php){  
                rewrite (.*) $1/index.php;  
            }  
            if (!-f $request_filename){  
                rewrite (.*) /index.php;  
            }  
        }
    }
    ```
6. If you write markdown, place a pre tag for compatibility. Note that there shouldn't be any HTML tags in the markdown content. If you need HTML, close the pre tag first.
    ```html
    <pre lang="markdown" class="lang:markdown">
       # markdown goes here
    </pre>
    ```    

## License

MIT License.

## Contribute

Cool you.
