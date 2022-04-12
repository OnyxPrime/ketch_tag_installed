# Ketch Tag Installed
This application checks whether or not a give site(s) has the Ketch Smart Tag added to the website.

There are 2 modes this application runs:
- File processing server
- Web server

## File processing server mode
When run in file processing mode, the application will run through a list of URLs from a specified file. The results from the processing will then be output to a file containing the URL, whether or not it contains the Ketch Smart Tag, time it took to process, and an error, if one occurred.

Options:
- `-i, --input <filepath>      filename containing list of url`
- `-t, --test                  Run test urls`
- `-o, --output <filepath>     filename to output results (default: "./results/results-2022-04-12.csv")`
- `-c, --concurrency <amount>  number of concurrent requests to make (default: 5)`
- `-h, --help                  display help for command`

An `--input` path is required, unless the `--test` flag is set.

## Web server
When run in web server mode, the application will server a web page allowing the user to enter up to 3 URLs for processing. Upon completion of processing, the results are returned and displayed on the web page. 

Options:
 - `-p, --port <number>      port number (default: 3000, env: PORT)`
 - `-c, --concurrency <int>  number of concurrent requests to make (default: 3)`
 - `-h, --help               display help for command`

 ## Containerizing
 ```shell
 docker build -t ketch/ketch_tag_detector:1.0 .

 docker run -dp 3000:3000 ketch_tag_detector
 ```

 ## Technologies used
 - Node
 - Puppeteer
 - Bluebird