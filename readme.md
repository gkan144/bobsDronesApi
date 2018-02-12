#### - What assumptions did you have to make?
Primarily, I had to assume that the schema of the api would not change without changing the url that accesses it.
By that I mean that while the api remained in v0 the types of information returned for each drone would be the same. Also, I had
to assume that the objects I was going to receive will always be flat. The values would always be either strings or
numbers and not objects. That assumption helped me avoid having to recursively handle nested objects when saving storing
them to the cache.
#### - Which technologies did you use? Why?
This solution is based on Node.js 8.9.4 with [Express](https://expressjs.com/). For caching I used
[Redis](https://redis.io/) and the solution is hosted on [Heroku](https://www.heroku.com/home)
(https://bobs-drones-api.herokuapp.com/api/v0/drones). Also, there are some unit tests implemented based on
[mocha](https://mochajs.org/) (test runner), [chai](http://chaijs.com/) (assertion library) and
[sinon.js](http://sinonjs.org/) (mocking library).

I used Node and Express because I already a very good working knowledge of them, and I was able to have a bare minimum
of functionality set up really quickly. I chose Heroku because I had used it in the past, it is free and provides
options that allowed me to set up the necessary environment quickly. Lastly, I used mocha, chai and sinon because they
are some of most well known tools for unit testing in JavaScript and I wanted to get better acquainted with them.
#### - What technical compromises did you have to make in order to achieve a solution? What is the severity of this tech debt, and what would a path to paying it down look like?
I had to make a few decisions on implementation in order to be able to deliver this solution in time. As mentioned
before, I had to assume that the responses from the api would always contain flat objects. While this made development
quicker it also moved the issue of nested objects to the future. We cannot reasonably expect that the structure of the
api will always be flat. Most api responses today usually contain nested objects. As such, at some point in the future
I should take the time to better implement the [flattenArrayOfObjects](/src/lib/cache/cacheClient.js#L64) and 
[inflateArrayOfObjects](/src/lib/cache/cacheClient.js#L83) methods. One approach I might follow is a recursive
solution.

An other issue that currently exists in the code is that the methods that handle setting objects and arrays do not
properly validate the input values. Specifically [setObject](/src/lib/cache/cacheClient.js#L142) should make sure that
the input object is a flat object while [setArrayOfObjects](/src/lib/cache/cacheClient.js#L166) should make sure that
the input array only contains flat objects. This is more urgent than the previous issue because if those methods receive
invalid input they will feed that input into the cache and it will end up with invalid or useless data.

Also, right now the [cacheClient](/src/lib/cache/cacheClient.js) wrapper object requires as a dependency an
implementation specific client that contains specifically named methods. The names of those methods and generally the
design of that part of the code is heavily influence by Redis. That means that if in the future I decide to change the
cache server, there is going to be a lot more work to redesign that part of the code to some that works with the new
cache. At some point I should take the time to research more into caching technologies and try to refactor this into a
more generic version.

One more point this solution is lacking in is automated testing. Some work has been done in writing unit tests for
some parts of the code, but the coverage is not very good right now. I need to put more work into finishing the unit
test suite and writing some integration tests. This is especially important in a Continuous Integration environment due
to the need for quick testing cycles.

Lastly, a quality of life improvement that can happen is to use a fully featured logging library, like
[winston](https://github.com/winstonjs/winston) in order to improve error reporting. Along with an integration with a service
like [Sentry](https://sentry.io/welcome/) this change should make debugging easier.

#### - How do we run your code?
First of all you need to have Node.js 8.9.4 installed. During development I also used [yarn](https://yarnpkg.com/en/)
for package management but npm should work too. You can use this command with yarn: `yarn install` or this with npm:
`npm install`.

Also, this solution was written with heroku in mind. This means that if you have the
[Heroku CLI tools](https://devcenter.heroku.com/articles/heroku-cli) installed you can use the following command to run
this server locally: `heroku local`. If you do not have the Heroku cli installed you can directly run the server through
with node by using either: `yarn start` or `npm start` depending on which package manager you are using.

Whichever method you use you also need to have a .env file created in the root folder of this project so that the
server's environment is initialized properly. The .env file must have values for the following variables:
`NODE_ENV, PORT, REDIS_URL`. For example:
~~~
NODE_ENV=development
PORT=3000
REDIS_URL=redis://g:<random-very-long-string>@<redis-hostname>:<redis-port>
~~~
You can also access the live version of this solution [here](https://bobs-drones-api.herokuapp.com/api/v0/drones).

#### - What future features do you think we might be able to build based on this API? How would the server you have written have to evolve to accomodate?
One possible new feature for the api would be to calculate a risk factor for each drone based on the number sold and the
number of crashes. This could be further enhanced if the calculations included the price of the drone. That way the api
might provide a provisional quote for insuring it. That would require to add another level in the server's design.
Between recovering the drones data and sending it to the client, the server would have to make those calculations.

In addition, we could add user specific information to the api either directly from this server or through another
service. The first solution should require integrating with an SQL or NoSQL database system, while the latter would
require this server to change to accommodate the new service. This functionality should allow us to provide better
information and make more informed decisions. For example, if we had the number of drone accidents a user had in the
past or information about the areas they like to fly around, we could modify the quote calculating algorithm to include
that information too.

Also, we can further enhance the information provided for each drone. We could communicate with third party apis or
search engine and enhance the content provided for each drone with more images or a description. Along, that road we
could also provide a reviews functionality for each drone. In this case our server would be responsible for storing the
reviews and aggregating them to a single score value.
