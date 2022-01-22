Instructions
- Copy `.env.example` as `.env`
  - Modify as needed, comments in the file should explain
- Run the script: `npm run calc`
  - Date defaults
    - From: first day of current year
    - To: current day
  - Override dates with `from` and/or `to` arguments using format `YYYY-MM-DD`
    - e.g. `npm run calc -- --from=2022-02-01 --to=2022-02-28`

Note: tested with node `12` and `14`,
node `16` has problems with the used [harvest](https://www.npmjs.com/package/harvest) (deprecated v1) lib.

TODO
* Update all libraries