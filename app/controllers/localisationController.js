
const { City, Department, Region } = require('../models');
const { Op } = require('sequelize');

const localisationController = {

    // Get the list of all cities

    getAllCities: async (req, res, next) => {
        try {
            const cities = await City.findAll({
                include: ['department']});
            res.json(cities);
        } catch (error) {
            console.trace(error);
            res.status(500).json(error);
        }
    },
    
    autocompleteCities: async (req, res, next) => {
        try {
            const search = req.params.search;

            const cities = await City.findAll({
                where: {
                    city_name: {
                        [Op.iLike]: `${search}%`
                    }
                },
                include: { 
                    association : 'department',
                    include: 'region'
                },
                limit: 5,
            });
            res.json(cities);
        } catch (error) {
            console.trace(error);
            res.status(500).json(error);
        }
    },

    // Get a city

    getOneCity: async (req, res, next) => {
        const id = req.params.id;
        try {
            const cities = await City.findByPk(id, {
                include: ['department']});
            res.json(cities);
        } catch (error) {
            console.trace(error);
            res.status(500).json(error);
        }
    },

    // Get a list of all department

    getAllDepartments: async (req, res, next) => {
        try {
            const departments = await Department.findAll({
                include: ['region']});
            res.json(departments);
        } catch (error) {
            console.trace(error);
            res.status(500).json(error);
        }
    },

    // Get a department

    getOneDepartment: async (req, res, next) => {
        const id = req.params.id;
        try {
            const department = await Department.findByPk(id, {
                include: ['region']});
            res.json(department);
        } catch (error) {
            console.trace(error);
            res.status(500).json(error);
        }
    },

    // Get the list of all region

    getAllRegions: async (req, res, next) => {
        try {
            const regions = await Region.findAll({
                include: ['departments']});
            res.json(regions);
        } catch (error) {
            console.trace(error);
            res.status(500).json(error);
        }
    },

    // Get one region

    getOneRegion: async (req, res, next) => {
        const id = req.params.id;
        try {
            const region = await Region.findByPk(id, {
                include: ['departments']});
            res.json(region);
        } catch (error) {
            console.trace(error);
            res.status(500).json(error);
        }
    },
};

module.exports = localisationController;