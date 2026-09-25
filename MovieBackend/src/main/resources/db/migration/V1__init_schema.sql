-- CineBook initial schema (PostgreSQL / Supabase).
-- Generated from the JPA entities with Hibernate's PostgreSQL dialect.

create table admins (
        is_active boolean,
        created_at timestamp(6),
        id bigserial not null,
        last_login timestamp(6),
        updated_at timestamp(6),
        email varchar(255) not null unique,
        first_name varchar(255),
        last_name varchar(255),
        password varchar(255) not null,
        role varchar(255) not null check (role in ('ADMIN','SUPER_ADMIN')),
        username varchar(255) not null unique,
        primary key (id)
    );

    create table booking_food_items (
        quantity integer not null,
        total_price numeric(10,2) not null,
        unit_price numeric(10,2) not null,
        booking_id bigint not null,
        created_at timestamp(6),
        food_item_id bigint not null,
        id bigserial not null,
        primary key (id)
    );

    create table bookings (
        convenience_fee numeric(10,0),
        food_total numeric(10,0),
        grand_total numeric(10,0),
        ticket_total numeric(10,0),
        total_amount float(53),
        booking_time timestamp(6),
        id bigserial not null,
        show_id bigint,
        updated_at timestamp(6),
        user_id bigint,
        booking_id varchar(255) unique,
        payment_id varchar(255) unique,
        payment_method varchar(255),
        seat_numbers TEXT,
        status varchar(255) check (status in ('CONFIRMED','CANCELLED','PENDING','COMPLETED')),
        primary key (id)
    );

    create table food_items (
        is_available boolean,
        price float(34) not null,
        created_at timestamp(6),
        id bigserial not null,
        theater_id bigint,
        updated_at timestamp(6),
        image_url varchar(500),
        category varchar(255) not null check (category in ('BEVERAGES','SNACKS','DESSERTS')),
        description TEXT,
        name varchar(255) not null,
        size varchar(255),
        primary key (id)
    );

    create table movie_cast (
        movie_id bigint not null,
        actor varchar(255)
    );

    create table movie_format (
        movie_id bigint not null,
        format varchar(255)
    );

    create table movies (
        price numeric(38,2),
        rating float(53),
        release_date date,
        id bigserial not null,
        tmdb_id bigint unique,
        backdrop_url varchar(500),
        description varchar(2000),
        certificate varchar(255),
        director varchar(255),
        duration varchar(255),
        genre varchar(255),
        language varchar(255),
        poster_url varchar(255),
        status varchar(255),
        title varchar(255),
        trailer varchar(255),
        primary key (id)
    );

    create table seats (
        is_wheelchair_accessible boolean not null,
        price float(53),
        seat_position integer,
        id bigserial not null,
        theater_id bigint,
        category varchar(255),
        row_letter varchar(255),
        seat_number varchar(255),
        primary key (id)
    );

    create table show_seats (
        booking_id bigint,
        expires_at timestamp(6),
        id bigserial not null,
        locked_at timestamp(6),
        locked_by_user_id bigint,
        seat_id bigint,
        show_id bigint,
        status varchar(255) check (status in ('AVAILABLE','BOOKED','LOCKED','TEMPORARILY_UNAVAILABLE')),
        primary key (id)
    );

    create table shows (
        ticket_price numeric(10,2) not null,
        id bigserial not null,
        movie_id bigint not null,
        show_time timestamp(6) not null,
        theater_id bigint not null,
        primary key (id)
    );

    create table theater_facilities (
        theater_id bigint not null,
        facility varchar(255)
    );

    create table theater_pricing (
        theater_id bigint not null,
        price varchar(255),
        time_slot varchar(255) not null,
        primary key (theater_id, time_slot)
    );

    create table theater_shows (
        theater_id bigint not null,
        show_time varchar(255)
    );

    create table theaters (
        number_of_screens integer,
        total_seats integer,
        created_at timestamp(6),
        id bigserial not null,
        updated_at timestamp(6),
        address varchar(255) not null,
        city varchar(255) not null,
        email varchar(255),
        location varchar(255) not null,
        name varchar(255) not null,
        phone_number varchar(255),
        pincode varchar(255) not null,
        state varchar(255) not null,
        status varchar(255) not null check (status in ('ACTIVE','INACTIVE','UNDER_MAINTENANCE')),
        primary key (id)
    );

    create table users (
        is_active boolean,
        created_at timestamp(6),
        id bigserial not null,
        last_login timestamp(6),
        updated_at timestamp(6),
        phone_number varchar(20),
        profile_picture varchar(500),
        date_of_birth varchar(255),
        email varchar(255) not null unique,
        first_name varchar(255) not null,
        last_name varchar(255) not null,
        password varchar(255) not null,
        role varchar(255) not null check (role in ('USER','PREMIUM_USER','ADMIN')),
        primary key (id)
    );

    alter table if exists booking_food_items 
       add constraint FKrvtvm9ilee4idnj9i9l1472d 
       foreign key (booking_id) 
       references bookings;

    alter table if exists booking_food_items 
       add constraint FK4fcm9exypn9icqwcaneprsspj 
       foreign key (food_item_id) 
       references food_items;

    alter table if exists bookings 
       add constraint FK5f9847fuaqx7qe2xug4e5pky1 
       foreign key (show_id) 
       references shows;

    alter table if exists bookings 
       add constraint FKeyog2oic85xg7hsu2je2lx3s6 
       foreign key (user_id) 
       references users;

    alter table if exists movie_cast 
       add constraint FKh3ht4nyhscwpt25ikwdu7lfqj 
       foreign key (movie_id) 
       references movies;

    alter table if exists movie_format 
       add constraint FKoxc87pycbnla9pa59kub6li39 
       foreign key (movie_id) 
       references movies;

    alter table if exists seats 
       add constraint FKmsuixaajp1jcew6m7ytikuhco 
       foreign key (theater_id) 
       references theaters;

    alter table if exists show_seats 
       add constraint FK8xn57t3sajoka5xvnk6mkwbsr 
       foreign key (booking_id) 
       references bookings;

    alter table if exists show_seats 
       add constraint FK90fydqa4vypob8jo7tkkic6c8 
       foreign key (locked_by_user_id) 
       references users;

    alter table if exists show_seats 
       add constraint FKrv3vjiyngf73knixxu2d4ac0d 
       foreign key (seat_id) 
       references seats;

    alter table if exists show_seats 
       add constraint FKldtrq74q8syptlbgqag9cw9w1 
       foreign key (show_id) 
       references shows;

    alter table if exists shows 
       add constraint FKqdpwhiv5r3lx844pct0eudapk 
       foreign key (movie_id) 
       references movies;

    alter table if exists shows 
       add constraint FK2jn1xrqhda6lv56dpegfb3gvn 
       foreign key (theater_id) 
       references theaters;

    alter table if exists theater_facilities 
       add constraint FKa3ekrat0emf16qci5du510o0o 
       foreign key (theater_id) 
       references theaters;

    alter table if exists theater_pricing 
       add constraint FKmt9wo0bli20umud5hyo0ksmlp 
       foreign key (theater_id) 
       references theaters;

    alter table if exists theater_shows 
       add constraint FKkwc3he2hch99x6vkl306paarb 
       foreign key (theater_id) 
       references theaters;

-- Supabase publishes every table in the public schema through its REST API.
-- CineBook only talks to the database through the Spring backend, which connects
-- as the table owner and is not subject to these rules. Enabling Row Level
-- Security with no policies shuts the public API out of every table.
alter table admins enable row level security;
alter table booking_food_items enable row level security;
alter table bookings enable row level security;
alter table food_items enable row level security;
alter table movie_cast enable row level security;
alter table movie_format enable row level security;
alter table movies enable row level security;
alter table seats enable row level security;
alter table show_seats enable row level security;
alter table shows enable row level security;
alter table theater_facilities enable row level security;
alter table theater_pricing enable row level security;
alter table theater_shows enable row level security;
alter table theaters enable row level security;
alter table users enable row level security;
-- (Flyway's own history table is locked down at startup by SupabaseLockdown,
--  because Flyway holds it while this migration runs.)
