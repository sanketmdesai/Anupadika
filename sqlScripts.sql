
drop database if exists trackingApp;

create database trackingApp;

use trackingApp;

create table Users (UserId bigint auto_increment , UserName varchar(50) , EmailId varchar(50) , lat float(20,15) , lng float(20,15) , password varchar(50), primary key(UserId));

create table Groups (GroupId bigint auto_increment , GroupName varchar(50) , primary key(GroupId));

create table User_Group_Relation(UserId bigint , GroupId bigint , foreign key(UserId) references Users(UserId) , foreign key(GroupId) references Groups(GroupId));

create table GroupAdmin(UserId bigint , GroupId bigint , foreign key(UserId) references Users(UserId) , foreign key(GroupId) references Groups(GroupId));



insert into Users (UserName , EmailId , lat , lng, password) values ("Sanket Desai","sanketmdesai@gmail.com" , 14.789874565423 , 72.789581254931,"1234");
insert into Users (UserName , EmailId , lat , lng, password) values ("Hardik Patel","hardikPatek4all@gmail.com" , 14.529874565423 , 72.129581254931,"1234");
insert into Users (UserName , EmailId , lat , lng, password) values ("Manish Joshi","joshisolutions@gmail.com" , 14.789874565423 , 72.789581254931,"1234");
insert into Users (UserName , EmailId , lat , lng, password) values ("Rohan Jani","rohanyjani@gmail.com" , 14.789874565423 , 72.789581254931,"1234");
insert into Users (UserName , EmailId , lat , lng, password) values ("Nimish Patankar","nimishpatankar@gmail.com" , 14.556874565423 , 72.789581254931,"1234");
insert into Users (UserName , EmailId , lat , lng, password) values ("Haemen Shah","smilesetter@gmail.com" , 14.336874565423 , 72.789581254931,"1234");
insert into Users (UserName , EmailId , lat , lng, password) values ("Vikram Jani","vikramjani@gmail.com" , 14.567874565423 , 72.789581254931,"1234");
insert into Users (UserName , EmailId , lat , lng, password) values ("Rajesh Mauriya","rajesh mauriya@gmail.com" , 14.259874565423 , 72.789581254931,"1234");
insert into Users (UserName , EmailId , lat , lng, password) values ("Ekta Thakker","ektathakker@gmail.com" , 14.869874565423 , 72.789581254931,"1234");
insert into Users (UserName , EmailId , lat , lng, password) values ("Chetan Diwani","cd@gmail.com" , 14.321874565423 , 72.789581254931,"1234");
insert into Users (UserName , EmailId , lat , lng, password) values ("Mayur","mayur@gmail.com" , 14.389874565423 , 72.789581254931,"1234");
insert into Users (UserName , EmailId , lat , lng, password) values ("Harshit","harshit@gmail.com" , 14.333874565423 , 72.789581254931,"1234");
insert into Users (UserName , EmailId , lat , lng, password) values ("Mehul","mehul@gmail.com" , 14.444874565423 , 72.789581254931,"1234");


insert into Groups (GroupName) values ("Office");
insert into Groups (GroupName) values ("Sabha");
insert into Groups (GroupName) values ("RoadTrip");
insert into Groups (GroupName) values ("Carpool");

insert into User_Group_Relation values (1,1);
insert into User_Group_Relation values (1,2);
insert into User_Group_Relation values (1,3);
insert into User_Group_Relation values (1,4);
insert into User_Group_Relation values (2,2);
insert into User_Group_Relation values (3,1);
insert into User_Group_Relation values (3,2);
insert into User_Group_Relation values (3,4);
insert into User_Group_Relation values (4,3);
insert into User_Group_Relation values (5,3);
insert into User_Group_Relation values (6,3);
insert into User_Group_Relation values (7,3);
insert into User_Group_Relation values (8,1);
insert into User_Group_Relation values (8,4);
insert into User_Group_Relation values (9,2);
insert into User_Group_Relation values (10,1);
insert into User_Group_Relation values (11,2);
insert into User_Group_Relation values (12,1);
insert into User_Group_Relation values (12,4);
insert into User_Group_Relation values (13,1);
insert into User_Group_Relation values (13,4);


select * from Users;


# Get all the groups for a given user email id
select GroupName from Groups where GroupId in 
(
    select GroupId from User_Group_Relation where UserId in
    (
            (select UserId from Users where EmailId like 'mayur@gmail.com')
    )
)
;
# get all the members of the given group
select UserName from Users where UserId in
(
    select UserId from User_Group_Relation where GroupId = 3
);

# get the group members from a group that belongs to a user things know is the group name and useremailid

select * from Users where UserId in
(
    select UserId from User_Group_Relation where GroupId in 
    ( 
        select GroupId from 
        (
            select * from Groups where GroupId in (
                select GroupId from  
                (
                    select * from User_Group_Relation where UserId in
                    (
                        select UserId from Users where EmailId like 'sanketmdesai@gmail.com' 
                    )
                ) as UserGroupsId
            ) 
        )as UserGroups where GroupName like 'Office'
    )
)
;
